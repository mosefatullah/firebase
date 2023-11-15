/**
 * Firebase.js (v0.1.1)
 * @Created by Mohammad Sefatullah
 * @License: MIT
 */

import { initializeApp } from "@firebase/app";
import {
 getAuth,
 signUpWithEmailAndPassword,
 signInWithEmailAndPassword,
 signInWithPopup,
 GoogleAuthProvider,
 onAuthStateChanged,
 signOut,
 deleteUser,
 deleteUsers,
 importUsers,
 verifyPasswordResetCode,
 confirmPasswordReset,
 checkActionCode,
 applyActionCode,
} from "@firebase/auth";
import * as $fdb from "@firebase/database";
import * as $fst from "@firebase/storage";

/* Note: Please add your firebase config here, or nothing will work */
export const $firebase_config = {
 apiKey: "",
 authDomain: "",
 databaseURL: "",
 projectId: "",
 storageBucket: "",
 messagingSenderId: "",
 appId: "",
};

export const $firebase_app = initializeApp($firebase_config);
export const $firebase_auth = getAuth($firebase_app);
export const $firebase_databse = $fdb.getDatabase($firebase_app);
export const $firebase_storage = $fst.getStorage($firebase_app);

const $handling = (r, e) => {
 try {
  if (!r || typeof r !== "function")
   throw new Error(
    "Firebase: First parameter is missing! (for result function)"
   );
  else r();
 } catch (er) {
  if (!e || typeof e !== "function")
   throw new Error(
    "Firebase: Second parameter is missing! (for error function)"
   );
  else e(er);
 }
};

export const $firebase = {
 /****** Authentication ******/
 /***/
 /***/
 /***/
 auth: {
  user: $firebase_auth.currentUser || null,
  on: (result, error) => {
   try {
    onAuthStateChanged($firebase_auth, (user) => {
     result(user);
    });
   } catch (e) {
    error(e);
   }
  },
  signupWithEmail: (email, password, result, error, conditional) => {
   $handling(
    () => {
     const $fn = async function () {
      await signUpWithEmailAndPassword($firebase_auth, email, password)
       .then(() => {
        result($firebase_auth.currentUser);
       })
       .catch((e) => {
        error(e);
       });
     };
     if (conditional) $fn();
     else conditional($fn);
    },
    (e) => {
     error(e);
    }
   );
  },
  loginWithEmail: (email, password, result, error, conditional) => {
   $handling(
    () => {
     const $fn = async function () {
      await signInWithEmailAndPassword($firebase_auth, email, password)
       .then(() => {
        result($firebase_auth.currentUser);
       })
       .catch((e) => {
        error(e);
       });
     };
     if (conditional) conditional($fn);
     else $fn();
    },
    (e) => {
     error(e);
    }
   );
  },
  loginWithGoogle: (result, error, conditional) => {
   $handling(
    () => {
     async function $fn() {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup($firebase_auth, provider)
       .then(() => {
        result(r);
       })
       .catch((e) => {
        error(e);
       });
     }
     if (conditional) $fn();
     else conditional($fn);
    },
    (e) => {
     error(e);
    }
   );
  },
  logout: (result, error) => {
   $handling(
    async () => {
     const r = await signOut($firebase_auth);
     result(r);
    },
    (e) => {
     error(e);
    }
   );
  },
  read: (data, result, error) => {
   $handling(
    async () => {
     importUsers($firebase_auth, data).then((r) => {
      r.errors.forEach((e) => {
       error(e);
      });
      result(r);
     });
    },
    (e) => {
     error(e);
    }
   );
  },
  update: () => {},
  delete: (uids, result, error) => {
   $handling(
    async () => {
     let r;
     if (typeof uids === "string" || typeof uids === "number")
      r = await deleteUser(uids);
     else if (Array.isArray(uids)) r = await deleteUsers(uids);
     result(r);
    },
    (e) => {
     error(e);
    }
   );
  },
  action: (mode, { code, lang = "en", newPassword }, result, error) => {
   $handling(
    () => {
     switch (mode) {
      case "resetPassword":
       handleResetPassword($firebase_auth, code, lang);
       break;
      case "recoverEmail":
       handleRecoverEmail($firebase_auth, code, lang);
       break;
      case "verifyEmail":
       handleVerifyEmail($firebase_auth, code, lang);
       break;
      default:
       error("Firebase: Invalid mode for Handling Email!");
     }
     function handleResetPassword(auth, actionCode, lang) {
      verifyPasswordResetCode(auth, actionCode)
       .then((email) => {
        confirmPasswordReset(auth, actionCode, newPassword)
         .then((resp) => {
          result(resp, email);
         })
         .catch((e) => {
          error(e);
         });
       })
       .catch((e) => {
        error(e);
       });
     }
     function handleRecoverEmail(auth, actionCode, lang) {
      let restoredEmail = null;
      checkActionCode(auth, actionCode)
       .then((info) => {
        restoredEmail = info["data"]["email"];
        return applyActionCode(auth, actionCode);
       })
       .then(() => {
        result(restoredEmail);
       })
       .catch((e) => {
        error(e);
       });
     }
     function handleVerifyEmail(auth, actionCode, lang) {
      applyActionCode(auth, actionCode)
       .then((resp) => {
        result(resp);
       })
       .catch((e) => {
        error(e);
       });
     }
    },
    (e) => {
     error(e);
    }
   );
  },
 },
 /****** Database ******/
 /***/
 /***/
 /***/
 database: {
  read: (path, result, error) => {
   $handling(
    () => {
     $fdb.onValue(
      $fdb.ref($firebase_databse, path),
      (snapshot) => {
       result(snapshot.val());
      },
      {
       onlyOnce: true,
      }
     );
    },
    (e) => {
     error(e);
    }
   );
  },
  write: (path, data, result, error) => {
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
  },
  update: (path, data, result, error) => {
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
  },
  delete: (path, result, error) => {
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
  },
  getKey: (path, error) => {
   let r = null;
   $handling(
    () => {
     r = $fdb.push($fdb.ref($firebase_databse, path)).key.substring(1);
    },
    (e) => {
     error(e);
    }
   );
   return r;
  },
 },
 /****** Storage ******/
 /***/
 /***/
 /***/
 storage: {
  upload: (path /* Single */, data, then) => {
   let metadata = {};
   if (!data.file) data.file = data;
   else if (data.file && data.metadata) metadata = data.metadata;
   $handling(
    () => {
     then(
      $fst.uploadBytes($fst.ref($firebase_storage, path), data.file, metadata)
     );
    },
    (e) => {
     throw new Error(e);
    }
   );
  },
  download: (path /* Single */, result, error) => {
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
  },
  downloads: (path /* Multiple */, result, error) => {
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
  },
  delete: (path /* Single */, result, error) => {
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
  },
 },
};

export default $firebase;
