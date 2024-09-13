import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBma9p0DEr69dzkmtwZ2Zv1ekgA3vxB6ic",
  authDomain: "superchat-app-17582.firebaseapp.com",
  projectId: "superchat-app-17582",
  storageBucket: "superchat-app-17582.appspot.com",
  messagingSenderId: "324367972932",
  appId: "1:324367972932:web:5d284c0c0fbe7c93f49a11",
  measurementId: "G-CDYYFGV9LY"
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Superchat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

function ChatRoom() {

  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);  // Corrected to `createdAt` if it's a typo

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMesage = async(e) => {

    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <div ref={dummy}></div>
    </main>

    <form onSubmit={sendMesage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
      <button type='submit'>Send</button>
    </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
  <div className={`message ${messageClass}`}>
    <img src={photoURL} />
    <p>{text}</p>
    </div>

  )
}

export default App;
