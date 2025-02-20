import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { theme } from "./color";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const onChangeText = (e) => {
    // 이벤트 자체가 텍스트임
    setText(e);
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));

    try {
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadToDos();
  }, []);

  const saveToDo = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const addTodo = async () => {
    if (text === "") return;
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });
    const newToDos = { ...toDos, [Date.now()]: { text, working } };
    console.log(newToDos);

    setToDos(newToDos);
    await saveToDo(newToDos);
    setText("");
  };

  const deleteToDo = async (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm Sure",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          delete newToDos[key];

          setToDos(newToDos);
          await saveToDo(newToDos);
        },
      },
    ]);
    return;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={[styles.btnText, working && { color: "#fff" }]}>
            Work
          </Text>
        </TouchableOpacity>
        <Pressable onPress={travel} hitSlop={100}>
          <Text style={[styles.btnText, !working && { color: "#fff" }]}>
            Travel
          </Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder={working ? "Add To Do" : "Where do you want to go?"}
        value={text}
        onChangeText={onChangeText}
        onSubmitEditing={addTodo}
        returnKeyType="Done"
        // autoCapitalize="words" // 문자 변환을 어떻게 할지?
        // keyboardType="phone-pad" 키보드 타입 정의
        // returnKeyType="send" 엔터 공간에 들어가는 텍스트
        // secureTextEntry={true} 비밀번호
        // multiline
      />
      <ScrollView>
        {toDos &&
          Object.keys(toDos).map((key) =>
            toDos[key].working === working ? (
              <View style={styles.toDo} key={key}>
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Text>
                    <FontAwesome
                      name="trash-o"
                      size={20}
                      color="rgba(255,255,255,0.5)"
                    />
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  btnText: {
    color: theme.grey,
    fontSize: 38,
    fontWeight: 600,
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: "grey",
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
