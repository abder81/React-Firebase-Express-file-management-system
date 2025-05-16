import { toast } from "react-toastify";
import { auth, database } from "../../API/firebase";
import userModel from "../../models/users";
import { RESET_USER, SET_USER } from "../actions/authActions";
import { RESET_FOLDERS_FILES } from "../actions/filefoldersActions";

const setUser = ({ userId, user, isAdmin }) => ({
  type: SET_USER,
  payload: { userId, user, isAdmin },
});

const resetUser = () => ({
  type: RESET_USER,
});

export const registerUser =
  ({ name, email, password }, setError) =>
  (dispatch) => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        setError("");
        const newUser = userModel(email, name, user.user.uid);
        auth.currentUser.updateProfile({
          displayName: name,
        });

        database.users.add(newUser).then((usr) => {
          dispatch(
            setUser({
              userId: user.user.uid,
              user: { data: user.user.providerData[0] },
            })
          );
          toast.success("User registered successfully!!");
        });
      })
      .catch((err) => {
        console.log(err);
        if (err.code === "auth/email-already-in-use") {
          setError("Email Already Exists!");
        }
      });
  };

export const loginUser =
  ({ email, password }, setError) =>
  (dispatch) => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(async (user) => {

       // 1) Get custom claims
       const tokenResult = await result.user.getIdTokenResult(true);
       const isAdmin = !!tokenResult.claims.admin;
       // 2) (Optional) Load your user metadata as before
       // const usr = await database.users.where("uid", "==", result.user.uid).get();
       // 3) Dispatch with isAdmin
       dispatch(setUser({
         userId: result.user.uid,
         user: { data: result.user.providerData[0] },
         isAdmin,
       }));

      })
      .catch(() => {
        setError("Invalid Email Or Password!");
      });
  };

export const getUser = () => (dispatch) => {
  auth.onAuthStateChanged(async function (user) {
    if (user) {
     const tokenResult = await user.getIdTokenResult();
     dispatch(setUser({
       userId: user.uid,
       user: { data: user.providerData[0] },
       isAdmin: !!tokenResult.claims.admin,
     }));
    } else {
      dispatch(resetUser());
    }
  });
};

const reserFilesFolders = () => ({
  type: RESET_FOLDERS_FILES,
});

export const logoutUser = () => (dispatch) => {
  auth.signOut().then(() => {
    dispatch(resetUser());
    dispatch(reserFilesFolders());
  });
};
