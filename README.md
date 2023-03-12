MongoDB lokaalne käivitamine:

    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="F:\chatappdb"

backend .env sisu näidis:

    API_PORT="5000"
    SOCKET_PORT="5001"
    DB_CONN_STRING="mongodb://localhost:27017"
    DB_NAME="chatappDB"
    MESSAGES_COLLECTION_NAME="MESSAGES"
    USERS_COLLECTION_NAME="users"
