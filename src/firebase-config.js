// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyDEJ0HLwSZDka1IUP39ImuaPtS5X82yMJk",
    authDomain: "login-15ce2.firebaseapp.com",
    projectId: "login-15ce2",
    storageBucket: "login-15ce2.appspot.com",
    messagingSenderId: "37280533845",
    appId: "1:37280533845:web:2f4063b611a33e87a473dc",
    measurementId: "G-5DYKJMKNVX"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // If already initialized, use that one
}

const db = firebase.firestore();
const auth = firebase.auth();