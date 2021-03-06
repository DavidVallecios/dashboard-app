import React, { useEffect, useState } from "react";
import './App.css';
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import firebase from './firebase/firebase'
import 'firebase/auth';
import Swal from "sweetalert2";

export const App = () => {
  const [user, setUser] = useState(Boolean(localStorage.getItem('loginSession')));

  useEffect(() => {
    firebase.auth().onAuthStateChanged((response) => {
      if(response){
        if(response.uid === 'INAPYSs5U4Ve78SDY7zLXYj2uJt2'){
          localStorage.setItem('idToken', response.ya);
          setUser(response);
        }else{
          firebase.auth().signOut();
          Swal.fire({
            title: "¡Oops!",
            text:
              "No tienes acceso al dashboard",
            icon: "error"
          });
          setUser(null);
        }
      }else{
        setUser(null);
      }
    })
  }, []);

  return (
    <>
      {user ? (
        <Auth />
      ) : (
        <Login />
      )}
    </>
  );
};
