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
import Checkbox from "expo-checkbox";

const STORAGE_KEY = "@toDos";
const STORAGE_VIEW_KEY = "@toDos_View";

export default function App() {
  const [working, setWorking] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [toDos, setToDos] = useState({});

  const [input, setInput] = useState({
    text: "",
    working: working,
    done: false,
  });

  const travel = () => setWorking(false);
  const work = () => setWorking(true);

  const onChangeText = (e) => {
    // 이벤트 자체가 텍스트임
    setInput((prev) => ({
      ...prev,
      text: e,
    }));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    setToDos(JSON.parse(s));

    try {
    } catch (err) {
      console.log(err);
    }
  };

  const loadsView = async () => {
    const view = await AsyncStorage.getItem(STORAGE_VIEW_KEY);
    setWorking(JSON.parse(view));
  };

  useEffect(() => {
    loadToDos();
    loadsView();
  }, []);

  useEffect(() => {
    const saveView = async () => {
      await AsyncStorage.setItem(STORAGE_VIEW_KEY, JSON.stringify(working));
    };

    saveView();
  }, [working]);

  const saveToDo = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };

  const addTodo = async () => {
    if (input.text === "") return;
    // const newToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });

    if (!working)
      setInput((prev) => ({
        ...prev,
        working: e,
      }));

    const newToDos = { ...toDos, [Date.now()]: input };

    setToDos(newToDos);
    await saveToDo(newToDos);
    setInput((prev) => ({
      ...prev,
      text: "",
    }));
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
        value={input.text}
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
                {editingId === key ? (
                  <TextInput
                    style={styles.toDoTextEdit}
                    value={toDos[key].text}
                    onChangeText={(e) => {
                      const newToDos = {
                        ...toDos,
                        [key]: {
                          ...toDos[key],
                          text: e,
                        },
                      };
                      setToDos(newToDos);
                      saveToDo(newToDos);
                    }}
                    onSubmitEditing={async () => {
                      await saveToDo(toDos);
                      setEditingId(null);
                    }}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                  />
                ) : (
                  <Text
                    style={[
                      styles.toDoText,
                      toDos[key].done && styles.toDoTextDone,
                    ]}
                  >
                    {toDos[key].text}
                  </Text>
                )}
                <View style={styles.toDoBtns}>
                  <Checkbox
                    value={toDos[key].done}
                    onValueChange={async () => {
                      const newToDos = {
                        ...toDos,
                        [key]: {
                          ...toDos[key],
                          done: !toDos[key].done,
                        },
                      };
                      setToDos(newToDos);
                      await saveToDo(newToDos);
                    }}
                    color={"#666"}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (editingId === key) {
                        setEditingId(null);
                      } else {
                        setEditingId(key);
                      }
                    }}
                  >
                    <FontAwesome
                      name="pencil-square-o"
                      size={20}
                      color="rgba(255,255,255,0.5)"
                    />
                  </TouchableOpacity>
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
  toDoTextEdit: {
    height: "auto",
    backgroundColor: "white",
    width: "70%",
  },
  toDoBtns: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoTextDone: {
    textDecorationLine: "line-through",
    color: "#333",
  },
});
