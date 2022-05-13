import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { RootTabScreenProps } from "../types";
import * as Location from "expo-location";
import opencage from "opencage-api-client";
import { useSelector, useDispatch } from "react-redux";
import { setlocations } from "../redux/locationSlice";
import moment from 'moment';

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const dispatch = useDispatch();
  const limit = 10000;
  let count = 0;
  const [curr_Location, setCurr_Location] = useState(null);
  const [locationList, setLocationList] = useState([]);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      reverseGeocode(loc.coords.latitude, loc.coords.longitude);
      setInterval(async () => {
        count++;
        if (count < 3) {
          let loc = await Location.getCurrentPositionAsync({});
          reverseGeocode(loc.coords.latitude, loc.coords.longitude);
        }
      }, limit);
    })();
    return ()=> clearInterval();
  }, []);
  useEffect(() => {
    if (curr_Location) {
      setTimeout(()=>{
        setLocationList((old) => [...old, curr_Location]);
      },limit);
    }
    return ()=> clearTimeout();
  }, [curr_Location]);
  const reverseGeocode = (lat: number, long: number) => {
    let coord = lat.toString() + "," + long.toString();
    const key = "81c63d70bd674883aa306de6592256d1";

    opencage
      .geocode({ key, q: coord })
      .then((response) => {
        let result = response.results[0].formatted;
        let time = response.timestamp;
        let data = {
          location_name: result,
          time: time,
        };
        apiCall(data);
        dispatch(setlocations(coord));
        setCurr_Location(data);
      })
      .catch((e) => console.log(e));
  };
  const removelocation = (val: number) => {
    const prevLocation = locationList.filter(
      (loc) => loc.time.created_unix != val
    );
    setLocationList(prevLocation);
  };
  const apiCall = (val: any) => {
    let data = {
      location_name: val.location_name,
      time: val.time.created_unix,
    };
    fetch("https://httpstat.us/200", {
      method: "POST",
      headers: {
        "Accept":"application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json(),
      )
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  return (
    <View style={styles.container}>
      <Text style={{ marginVertical: 5 }}>Current Location</Text>
      <View style={{ flexDirection: "row", width: "85%" }}>
        <View
          style={{
            height: 50,
            width: 50,
            borderRadius: 25,
            backgroundColor: "orange",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>NA</Text>
        </View>
        <View style={{ marginLeft: 5 }}>
          <Text style={styles.title} numberOfLines={1}>
            {curr_Location?.location_name || "Getting location..."}
          </Text>
          <Text>{moment.unix(curr_Location?.time?.created_unix).format('L')+', '+moment.unix(curr_Location?.time?.created_unix).format('H:mm:ss')}</Text>
        </View>
      </View>
      <Text style={{ marginVertical: 5 }}>Previous Locations</Text>
      <ScrollView>
        {locationList.map((list, index) => {
          return (
            <View
              style={{ flexDirection: "row", marginVertical: 2 }}
              key={list?.time?.created_http}
            >
              <View style={{ width: "75%" }}>
                <Text style={styles.title} numberOfLines={1}>
                  {list?.location_name}
                </Text>
                <Text>{moment.unix(list?.time?.created_unix).format('L')+', '+moment.unix(list?.time?.created_unix).format('H:mm:ss')}</Text>
              </View>
              <TouchableOpacity
                style={{
                  height: 50,
                  borderRadius: 5,
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  backgroundColor: "#b5b5b3",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  removelocation(list?.time?.created_unix);
                }}
              >
                <Text style={{ color: "white" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        style={{
          backgroundColor: "blue",
          width: "70%",
          position: "absolute",
          bottom: 50,
          alignSelf: "center",
          padding: 10,
          borderRadius: 5,
          alignItems: "center",
        }}
        onPress={() => {
          setLocationList([]);
          count=0;
        }}
      >
        <Text style={{ color: "white" }}>Clear all</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
});
