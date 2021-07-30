## Klutch Fire Hooks

### Installation

Klutch Fire Hooks is a fork of react-firebase-hooks, specifically built and refactored to accomodate the Firebase v9 Beta JavaScript SDK. Support for the 
Realtime database and single document queries were removed, as well as the signUp/signIn auth hooks to minimize package size and allow for easier tests for now.

```bash
# with npm
npm install --save klutch-fire-hooks

```

### Features

1. useAuthState() hook
2. Firestore collection queries
3. Snapshot listeners for Firestore collections
4. Storage uploads, downloads and management

```javascript
// useAuthState() example
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { useAuthState } from 'klutch-fire-hooks';

// Initialize
const firebaseApp = initializeApp(firebaseConfig);
// Firestore
export const firestore = getFirestore(firebaseApp);
// Storage
export const storage = getStorage(firebaseApp);
// Auth
export const auth = getAuth(firebaseApp);

// App component () => ...
const [user, loading, error] = useAuthState(auth);

// useAuthState with the context API 
export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for storage uploads
const useFirebaseStorage = (file) => {
  const [user] = useAuthState(auth);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [url, setURL] = useState("");

  const uploadFile = async () => {
    const ext = file.type.split("/")[1];
    const storageRef = ref(storage, `Avatars/${user.uid}/${Date.now()}.${ext}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snap) => {
        let pct = Math.floor(snap.bytesTransferred / snap.totalBytes) * 100;
        setProgress(pct);
      },
      function (error) {
        setError(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setURL(downloadURL)
        );
      }
    );
  };

  useEffect(() => {
    uploadFile(file);
    return () => uploadFile();
  }, [file]);

  return { progress, error, url };
};


```