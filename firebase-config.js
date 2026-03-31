const firebaseConfig = {
    apiKey: atob("QUl6YVN5QXJqZU1xRVktb2ZsX3VXeVU1aDlLamtranppNkV3eHdzSQ=="),
    authDomain: atob("bHNzZC10c2QtcGFuZWwuZmlyZWJhc2VhcHAuY29t"),
    databaseURL: atob("aHR0cHM6Ly9sc3NkLXRzZC1wYW5lbC1kZWZhdWx0LXJ0ZGIuZmlyZWJhc2Vpby5jb20="),
    projectId: atob("bHNzZC10c2QtcGFuZWw="),
    storageBucket: atob("bHNzZC10c2QtcGFuZWwuZmlyZWJhc2VzdG9yYWdlLmFwcA=="),
    messagingSenderId: atob("NjM1NDUxMzk1NDQ0"),
    appId: atob("MTo2MzU0NTEzOTU0NDQ6d2ViOmExNjZjNTg0MmY0NTljN2VlZGIwMjE="),
    measurementId: atob("Ry02TkdFSzYwR1lD")
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
