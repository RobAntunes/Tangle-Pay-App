import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
} from "react-native";
import { supabase } from "../lib/supabase";
import LoginScreen from "./auth/login";
import SignupScreen from "./auth/signup";

export default () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log(error);
      } else {
        setIsSignedIn(data !== null);
      }
    })();
  }, []);

  return (
    <SafeAreaView>
      {isSignedIn ? <SignupScreen /> : <LoginScreen />}
    </SafeAreaView>
  );
};
