package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	// loosely check if it was executed using "go run"
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Dashboard
		// (the isGoRun check is to enable it only during development)
		Automigrate: isGoRun,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		se.Router.GET("/hello/{name}", func(e *core.RequestEvent) error {
			name := e.Request.PathValue("name")

			return e.String(http.StatusOK, "Hello "+name)
		})

		se.Router.GET("/api/groups/", func(e *core.RequestEvent) error {
			for name, values := range e.Request.Header {
				for _, value := range values {
					fmt.Printf("Header: %s = %s\n", name, value)
				}
			}
			user_id := e.Request.Header.Get("User-id")
			fmt.Println("Made it here", user_id)
			groups, err := e.App.FindRecordsByFilter("groups", "users_in_group ~ {:userId}", "-created", 0, 0, dbx.Params{
				"userId": user_id,
			})

			if err != nil {
				fmt.Println("EWrror: ", err)
				return e.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch groups"})
			}

			var groups_to_send []string

			for _, group := range groups {
				groups_to_send = append(groups_to_send, group.GetString("name"))
			}

			fmt.Println("Made it to status ok", groups_to_send)
			return e.JSON(http.StatusOK, groups_to_send)
		})
		// }).Bind(apis.RequireAuth())

		se.Router.GET("/api/expenses/", func(e *core.RequestEvent) error {
			return e.JSON(http.StatusOK, {})
		})

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
