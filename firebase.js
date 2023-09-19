/**
 * Firebase.js (v0.1.0)
 * @Created by Mohammad Sefatullah
 * @License: MIT
 */

import { initializeApp } from "@firebase/app";
import {
 getAuth,
 signInWithEmailAndPassword,
 signInWithPopup,
 browserPopupRedirectResolver,
 GoogleAuthProvider,
 onAuthStateChanged,
 signOut,
} from "@firebase/auth";
import * as $fdb from "@firebase/database";
import * as $fst from "@firebase/storage";

const firebaseConfig = {
 apiKey: "AIzaSyBm3d0-_5Ll3uYxaNeGiPizR9WTUYVmnTk",
 authDomain: "specialstars-dev.firebaseapp.com",
 databaseURL:
  "https://specialstars-dev-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId: "specialstars-dev",
 storageBucket: "specialstars-dev.appspot.com",
 messagingSenderId: "930978839693",
 appId: "1:930978839693:web:280b4a16f438ee86b636c4",
};

/** Root Supplying **/
export const $firebase = initializeApp(firebaseConfig);
export const $firebase_auth = getAuth($firebase);
export const $firebase_databse = $fdb.getDatabase($firebase);
export const $firebase_storage = $fst.getStorage($firebase);

export const $firebase_auth_cuid = $firebase_auth.currentUser?.uid;

const $handling = (r, e) => {
 try {
  if (!r || typeof r !== "function")
   throw new Error("First parameter is missing!");
  else r();
 } catch (er) {
  if (!e || typeof e !== "function")
   throw new Error("Second parameter is missing!");
  else e(er);
 }
};

/****** Authentication ******/
/***/
/***/
/***/

export const $firebase_auth_login_email = async (
 email,
 password,
 result,
 error
) => {
 $handling(
  async () => {
   const userCredential = await signInWithEmailAndPassword(
    $firebase_auth,
    email,
    password
   );
   result(userCredential);
  },
  (e) => {
   return error(e);
  }
 );
};

export const $firebase_auth_login_google = async (result, error) => {
 $handling(
  async () => {
   const provider = new GoogleAuthProvider();
   const r = await signInWithPopup(
    $firebase_auth,
    provider,
    browserPopupRedirectResolver
   );
   result(r);
  },
  (e) => {
   return error(e);
  }
 );
};

export const $firebase_auth_logout = async (result, error) => {
 $handling(
  async () => {
   const r = await signOut($firebase_auth);
   result(r);
  },
  (e) => {
   return error(e);
  }
 );
};

export const $firebase_auth_onAuth = (result, error) => {
 try {
  onAuthStateChanged($firebase_auth, (user) => {
   result(user);
  });
 } catch (e) {
  error(e);
 }
};

/****** Database ******/
/***/
/***/
/***/
// { getDatabase, ref, onValue, set, update }

export const $firebase_database_read = (path, result, error) => {
 $handling(
  () => {
   $fdb.onValue($fdb.ref($firebase_databse, path), (snapshot) => {
    result(snapshot.val());
   });
  },
  (e) => {
   error(e);
  }
 );
};

export const $firebase_database_write = (path, data, result, error) => {
 /* Note: (Overwrites) */
 $handling(
  () => {
   $fdb
    .set($fdb.ref($firebase_databse, path), data)
    .then((s) => {
     result(true, s);
    })
    .catch((e) => {
     if (error) error(e);
    });
  },
  (e) => {
   error(e);
  }
 );
};

export const $firebase_database_update = (path, data, result, error) => {
 /* Note: (Doesn't Overwrite) */
 $handling(
  () => {
   $fdb
    .update($fdb.ref($firebase_databse, path), data, { merge: true })
    .then((s) => {
     result(true, s);
    })
    .catch((e) => {
     if (error) error(e);
    });
  },
  (e) => {
   error(e);
  }
 );
};

export const $firebase_database_delete = (path, result, error) => {
 $handling(
  () => {
   $fdb
    .remove($fdb.ref($firebase_databse, path))
    .then((s) => {
     result(true, s);
    })
    .catch((e) => {
     if (error) error(e);
    });
  },
  (e) => {
   error(e);
  }
 );
};

/****** Storage ******/
/***/
/***/
/***/
/* { getStorage, ref, uploadBytes, listAll, getDownloadURL, deleteObject } */

export const $firebase_storage_upload = (
 path /* Single */,
 data,
 result,
 error
) => {
 let metadata = {};
 if (!data.file) data.file = data;
 else if (data.file && data.metadata) metadata = data.metadata;
 $handling(
  () => {
   $fst
    .uploadBytes($fst.ref($firebase_storage, path), data.file, metadata)
    .then((s) => {
     result(true, s);
    })
    .catch((e) => {
     if (error) error(e);
    });
  },
  (e) => {
   error(e);
  }
 );
};

export const $firebase_storage_download = (
 path /* Single */,
 result,
 error
) => {
 $handling(
  () => {
   $fst
    .getDownloadURL($fst.ref($firebase_storage, path))
    .then((s) => {
     result(s);
    })
    .catch((e) => {
     if (error) error(e);
    });
  },
  (e) => {
   error(e);
  }
 );
};

export const $firebase_storage_download2 = (
 path /* Multiple */,
 result,
 error
) => {
 $handling(
  () => {
   $fst
    .listAll($fst.ref($firebase_storage, path))
    .then((s) => {
     result(s);
    })
    .catch((e) => {
     if (error) error(e);
    });
  },
  (e) => {
   error(e);
  }
 );
};

export const $firebase_storage_delete = (path /* Single */, result, error) => {
 $handling(
  () => {
   $fst
    .deleteObject($fst.ref($firebase_storage, path))
    .then((s) => {
     result(s);
    })
    .catch((e) => {
     if (error) error(e);
    });
  },
  (e) => {
   error(e);
  }
 );
};

export default $firebase;
