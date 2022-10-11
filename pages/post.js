import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Head from "next/head";

export default function Post() {
  //Form state
  const [post, setPost] = useState({ description: "" });
  const [user, loading] = useAuthState(auth);
  const route = useRouter();
  const routeData = route.query;

  //Submit post
  const submitPost = async (e) => {
    e.preventDefault();

    //Run checks for description
    if (!post.description) {
      toast.error("Description field is empty");
      return;
    }

    if (post.description.length > 300) {
      toast.error("Description is too long");
      return;
    }

    if (post?.hasOwnProperty("id")) {
      const docRef = doc(db, "posts", post.id);
      const updatedPost = { ...post, timestamp: serverTimestamp() };
      await updateDoc(docRef, updatedPost);
      toast.success("Post updated successfully");
      return route.push("/");
    } else {
      //Make a new post
      const collectionRef = collection(db, "posts");
      await addDoc(collectionRef, {
        ...post,
        timestamp: serverTimestamp(),
        user: user.uid,
        avatar: user.photoURL,
        username: user.displayName,
      });
      toast.success("Post created successfully");
    }
    setPost({ description: "" });
    return route.push("/");
  };

  //Check our user
  const checkUser = async () => {
    if (loading) return;
    if (!user) route.push("/auth/login");
    if (routeData.id) {
      setPost({ description: routeData.description, id: routeData.id });
    }
  };

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  return (
    <div className="p-12 shadow-2xl rounded-lg max-w-md mx-auto">
      <Head>
        <title>{post.hasOwnProperty("id") ? "Edit Post" : "Create Post"} | Community</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="shortcut icon" href="/logo.png" type="image/x-icon" />
      </Head>
      <form onSubmit={submitPost}>
        <h1 className="text-2xl font-bold">
          {post.hasOwnProperty("id") ? "Edit your post" : "Create a new post"}
        </h1>
        <div className="py-4">
          <textarea
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            className="h-48 w-full rounded-lg p-2 text-sm outline-none shadow-inner bg-gray-100"
            placeholder="Write your post here..."
          ></textarea>
          <p
            className={`text-cyan-500  font-medium text-sm ${
              post.description.length > 300 ? "text-red-600" : ""
            }`}
          >
            {post.description.length}/300
          </p>
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium p-2 my-2 rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
