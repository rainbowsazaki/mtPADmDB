import store from './store';

import * as firebase from 'firebase/app';
import 'firebase/auth';

const fbConfig = {
  apiKey: 'AIzaSyDsuE62yeIvn9Usn2-yPIXFYSLUm2LKV2I',
  authDomain: 'mtpadmdb-65e48.firebaseapp.com',
  databaseURL: 'https://mtpadmdb-65e48.firebaseio.com',
  projectId: 'mtpadmdb-65e48',
  storageBucket: 'mtpadmdb-65e48.appspot.com',
  messagingSenderId: '700582981211',
  appId: '1:700582981211:web:5da7d35c745b4b3152d97e',
  measurementId: 'G-N5NHV1BECG'
};

/** ログイン処理を行う。 */
export function signIn () {
  const provider = new firebase.auth.TwitterAuthProvider();
  if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
    firebase.auth().signInWithRedirect(provider);
  } else {
    firebase.auth().signInWithPopup(provider).then(function (result) {
      // console.log(result);
    });
  }
}

/** ログアウト処理を行う。 */
export function signOut () {
  firebase.auth().signOut();
}

firebase.initializeApp(fbConfig);
firebase.auth().getRedirectResult().then(function (result) {
  // console.log('login:', result);
  store.commit('updateUserAccount', {});
  // if (result.credential) {
  //   // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
  //   // You can use these server side with your app's credentials to access the Twitter API.
  //   const token = result.credential.accessToken;
  //   const secret = result.credential.secret;
  //   // ...
  // }
  // // The signed-in user info.
  // var user = result.user;
}).catch(function (error) {
  console.log('login error:', error);
  // // Handle Errors here.
  // const errorCode = error.code;
  // const errorMessage = error.message;
  // // The email of the user's account used.
  // const email = error.email;
  // // The firebase.auth.AuthCredential type that was used.
  // const credential = error.credential;
});

// オブザーバーの登録
firebase.auth().onAuthStateChanged(user => {
  // ログイン状態ならuserが取得できる
  // console.log(user);
  if (user) {
    store.commit('setMessages', ['ログインしました。']);
  } 
  store.commit('updateUserAccount', user || {});
  store.commit('loadFavorite');
});
