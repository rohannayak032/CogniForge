const STORAGE_KEY = 'cogniforge_user_id';

export function getOrCreateUserID() {
    let userID = localStorage.getItem(STORAGE_KEY);
    if (!userID) {
        userID = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, userID);
    }
    return userID;
}
