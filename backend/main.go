package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "myapp/migrations"
)

type dataType struct {
	Name      string   `json:"name"`
	Amount    string   `json:"amount"`
	Payer     []string `json:"payer"`
	Payee     []string `json:"payee"`
	GroupName string   `json:"groupName"`
}

func main() {
	app := pocketbase.New()

	// loosely check if it was executed using "go run"
	// isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())
	os.Args = append(os.Args, "--dir", "./pb_data") // adjust path if needed

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the isGoRun check is to enable it only during development)
		Automigrate: true,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// Given a user id display what groups they are associated with
		se.Router.GET("/api/groups", func(e *core.RequestEvent) error {
			user_id := e.Request.Header.Get("User-id")
			groups, err := e.App.FindRecordsByFilter("groups", "users_in_group ~ {:userId}", "-created", 0, 0, dbx.Params{
				"userId": user_id,
			})

			if err != nil {
				fmt.Println("Error: ", err)
				return e.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch groups"})
			}

			var groups_to_send []string

			for _, group := range groups {
				groups_to_send = append(groups_to_send, group.GetString("name"))
			}

			fmt.Println("Made it to status ok", groups_to_send)
			return e.JSON(http.StatusOK, groups_to_send)
		})

		// Given a group name return all expenses associated with that group
		se.Router.GET("/api/expenses", func(e *core.RequestEvent) error {
			groupName := e.Request.URL.Query().Get("groupName")

			if groupName == "" {
				return e.JSON(http.StatusBadRequest, map[string]string{
					"error": "Missing groupName parameter",
				})
			}

			expenses, err := e.App.FindRecordsByFilter("expense", "associated_group.name = {:groupName}", "-created", 0, 0,
				dbx.Params{"groupName": groupName})

			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]string{
					"error": err.Error(),
				})
			}

			app.ExpandRecords(expenses, []string{"payee", "payer"}, nil)
			return e.JSON(http.StatusOK, expenses)
		})

		// Given a group name return all users in that group
		se.Router.GET("/api/users", func(e *core.RequestEvent) error {
			groupName := e.Request.URL.Query().Get("groupName")

			if groupName == "" {
				return e.JSON(http.StatusBadRequest, map[string]string{
					"error": "Missing groupName parameter",
				})
			}

			users, err := e.App.FindRecordsByFilter("groups", "name = {:groupName}", "-created", 0, 0,
				dbx.Params{"groupName": groupName})

			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]string{
					"error": err.Error(),
				})
			}

			app.ExpandRecords(users, []string{"users_in_group"}, nil)
			return e.JSON(http.StatusOK, users)
		})

		// Post request of expenses and it to the ledger and the expenses table
		se.Router.POST("/api/add_expense", func(e *core.RequestEvent) error {
			data := dataType{}

			if err := e.BindBody(&data); err != nil {
				fmt.Printf("ERROR %v\n", err)
				return e.JSON(http.StatusBadRequest, map[string]string{"Error": "Invalid Request body."})
			}

			expenses, err := app.FindCollectionByNameOrId("expense")
			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]string{"Error": "Failed to find expenses table."})
			}

			// grab the groupId from the groupName
			groups, err := e.App.FindRecordsByFilter("groups", "name = {:groupName}", "-created", 0, 0,
				dbx.Params{"groupName": data.GroupName})

			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]string{"Error": "Can't find group."})
			}

			groupId := groups[0].Get("id")

			record := core.NewRecord(expenses)
			record.Set("name", data.Name)
			record.Set("amount", data.Amount)
			record.Set("payer", data.Payer)
			record.Set("payee", data.Payee)
			record.Set("associated_group", groupId)

			if err := app.Save(record); err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]string{"Error": "Unable to save expense"})
			}

			// updateLedger - this needs to check if such a record exists already
			ledger, err := app.FindCollectionByNameOrId("personal_ledger")
			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]string{"Error": "Failed to find ledger table."})
			}

			already_exists, _ := e.App.FindRecordsByFilter("personal_ledger", "payer = {:payer} && payee = {:payee} && group = {:groupID}", "-created", 0, 0,
				dbx.Params{"payer": data.Payer[0], "payee": data.Payee[0], "groupID": groupId})

			if len(already_exists) != 0 {
				// update the record
				record_to_update := already_exists[0]
				amount_to_change, _ := strconv.ParseFloat(data.Amount, 64)

				floatVal, ok := record_to_update.Get("amount").(float64)

				if !ok {
					// It might be stored as float64 depending on how PocketBase parsed the JSON
					log.Fatalf("Amount is not a number: %v", record_to_update.Get("amount"))
				}

				new_val := floatVal + float64(amount_to_change)

				record_to_update.Set("amount", new_val)
				if err := app.Save(record_to_update); err != nil {
					return e.JSON(http.StatusInternalServerError, map[string]string{"Error": "Unable to save transaction"})
				}

			} else {
				record = core.NewRecord(ledger)
				record.Set("payer", data.Payer[0])
				record.Set("payee", data.Payee[0])
				record.Set("group", groupId)
				record.Set("amount", data.Amount)

				if err := app.Save(record); err != nil {
					return e.JSON(http.StatusInternalServerError, map[string]string{"Error": "Unable to save transaction"})
				}
			}

			return e.JSON(http.StatusOK, record)
		})

		// Given a group and a user tell me their balances
		se.Router.GET("/api/balances", func(e *core.RequestEvent) error {
			groupName := e.Request.URL.Query().Get("groupName")
			userID := e.Request.URL.Query().Get("userID")

			if groupName == "" {
				return e.JSON(http.StatusBadRequest, map[string]string{
					"error": "Missing groupName parameter",
				})
			}

			// grab the groupId from the groupName
			groups, err := e.App.FindRecordsByFilter("groups", "name = {:groupName}", "-created", 0, 0,
				dbx.Params{"groupName": groupName})

			if err != nil {
				return e.JSON(http.StatusInternalServerError, map[string]string{"Error": "Can't find group."})
			}

			groupId := groups[0].Get("id")
			already_exists, _ := e.App.FindRecordsByFilter("personal_ledger", "payer = {:payer} && group = {:groupID}", "-created", 0, 0,
				dbx.Params{"payer": userID, "groupID": groupId})

			app.ExpandRecords(already_exists, []string{"payee", "payer"}, nil)
			return e.JSON(http.StatusAccepted, already_exists)

		})
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
