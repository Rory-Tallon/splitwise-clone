import PocketBase from 'pocketbase';

// Create a singleton instance of PocketBase
let pb;

// Get the PocketBase instance (creating it only once)
export function getPocketBase() {
    if (!pb) {
        pb = new PocketBase('/api/proxy');
    }
    return pb;
}