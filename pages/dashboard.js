import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Message from "../components/Message";
import { FiEdit2, FiTrash } from "react-icons/fi";
import Link from "next/link";
import Head from "next/head";

export default function Dashboard() {
  const route = useRouter();
  const [user, loading] = useAuthState(auth);
  const [posts, setPosts] = useState([]);

  //See if user is logged
  const getData = async () => {
    if (loading) return;
    if (!user) return route.push("/auth/login");
    const collectionRef = collection(db, "posts");
    const q = query(collectionRef, where("user", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });

    return unsubscribe;
  };

  //Delete post
  const deletePost = async (id) => {
    const docRef = doc(db, "posts", id);
    await deleteDoc(docRef);
  };

  //Get user data
  useEffect(() => {
    getData();
  }, [user, loading]);

  return (
    <div>
      <Head>
        <title>Dashboard | Community</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="shortcut icon" href="/logo.png" type="image/x-icon" />
      </Head>
      <h1>Your posts</h1>

      <div>
        {posts.length == 0 ? (
          <h2 className="text-sm my-3 text-gray-400">
            You haven't post anything yet.
          </h2>
        ) : (
          posts.map((post) => {
            return (
              <Message {...post} key={post.id}>
                <div className="flex gap-2">
                  <Link href={{ pathname: "/post", query: post }}>
                    <button className="bg-cyan-500 hover:bg-cyan-600 w-24 text-white px-3 rounded-md flex items-center justify-center gap-2 py-2 text-sm">
                      <FiEdit2 className="text-lg" />
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-cyan-500 hover:bg-cyan-600 w-24 text-white px-3 rounded-md flex items-center justify-center gap-2 py-2 text-sm"
                  >
                    <FiTrash className="text-lg" />
                    Delete
                  </button>
                </div>
              </Message>
            );
          })
        )}
      </div>
      <button
        className="bg-gray-700 hover:bg-gray-800 w-24 rounded-md py-2 px-3 my-6 text-white"
        onClick={() => auth.signOut()}
      >
        Sign out
      </button>
    </div>
  );
}