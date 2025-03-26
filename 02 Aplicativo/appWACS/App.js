import React, { useState, useEffect, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Vibration,
  Platform,
} from "react-native";
import * as Progress from "react-native-progress";

// Adicione esta dependência no terminal:
// npm install react-native-progress

const COMMANDS = {
  FORWARD: { code: "F", label: "Frente", color: "#4CAF50" },
  BACKWARD: { code: "B", label: "Trás", color: "#FF9800" },
  LEFT: { code: "E", label: "Esquerda", color: "#2196F3" },
  RIGHT: { code: "D", label: "Direita", color: "#2196F3" },
  STOP: { code: "S", label: "Parar", color: "#f44336" },
};

const CONNECTION_STATES = {
  DISCONNECTED: "Desconectado",
  CONNECTED: "Conectado (Simulação)",
  ERROR: "Erro de Conexão",
};

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState(
    CONNECTION_STATES.DISCONNECTED
  );
  const [lastCommand, setLastCommand] = useState("Nenhum");
  const [commandLog, setCommandLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(0); // Alterado para 0
  const [rearDistance, setRearDistance] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [isMovingBack, setIsMovingBack] = useState(false);

  const simulateArduinoData = useCallback(() => {
    if (isSimulation) {
      setBatteryLevel((prev) => Math.max(0, prev - 0.05));
      if (isMovingBack) {
        setRearDistance(Math.floor(Math.random() * (150 - 30 + 1) + 30));
      }
      setSpeed(Math.random() * 5);
    }
  }, [isSimulation, isMovingBack]);

  useEffect(() => {
    const interval = setInterval(simulateArduinoData, 1000);
    return () => clearInterval(interval);
  }, [simulateArduinoData]);

  const toggleSimulation = () => {
    const newState = !isSimulation;
    setIsSimulation(newState);
    setConnectionStatus(
      newState ? CONNECTION_STATES.CONNECTED : CONNECTION_STATES.DISCONNECTED
    );
    logCommand(
      "Sistema",
      newState ? "Modo simulação ativado" : "Modo simulação desativado"
    );
    if (!newState) resetValues();
  };

  const resetValues = () => {
    setBatteryLevel(0); // Alterado para 0
    setRearDistance(null);
    setSpeed(0);
    setIsMovingBack(false);
  };

  const logCommand = useCallback((type, message, status = "Enviando") => {
    setCommandLog((prevLog) => [
      {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
        status,
      },
      ...prevLog.slice(0, 49),
    ]);
  }, []);

  const sendCommand = async (direcao) => {
    if (!isSimulation) {
      Alert.alert("Modo Simulação", "Ative o modo simulação primeiro");
      return;
    }

    const command = Object.values(COMMANDS).find(
      (cmd) => cmd.label === direcao
    );
    if (!command) return;

    try {
      setIsLoading(true);
      setIsMovingBack(direcao === COMMANDS.BACKWARD.label);

      logCommand("Comando", `${command.code} - ${direcao}`);
      Vibration.vibrate(50);

      setTimeout(() => {
        logCommand("Confirmação", `${direcao} executado`, "Sucesso");
        setLastCommand(`${direcao}`);
        setIsLoading(false);
      }, 300);
    } catch (error) {
      logCommand("Erro", `Falha no comando ${direcao}`, "Erro");
      setIsLoading(false);
    }
  };

  const ControlButton = ({ label, onPress, color, disabled }) => (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color },
        disabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Controle Inteligente</Text>
        <TouchableOpacity
          style={[styles.connectButton, isSimulation && styles.connectedButton]}
          onPress={toggleSimulation}
        >
          <Text style={styles.buttonText}>
            {isSimulation ? "Desconectar" : "Simular Conexão"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bateria:</Text>
          <View style={styles.batteryContainer}>
            <Progress.Bar
              progress={isSimulation ? batteryLevel / 100 : 0}
              width={200}
              height={20}
              color={
                isSimulation
                  ? batteryLevel > 20
                    ? "#4CAF50"
                    : "#f44336"
                  : "#CCCCCC"
              }
              borderRadius={4}
            />
            <Text style={styles.batteryText}>
              {isSimulation ? `${batteryLevel.toFixed(1)}%` : "0%"}
            </Text>{" "}
          </View>
        </View>

        {rearDistance && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distância Traseira:</Text>
            <Text style={styles.distanceValue}>{rearDistance} cm</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Velocidade:</Text>
          <Text style={styles.speedValue}>{speed.toFixed(1)} km/h</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text
            style={[styles.statusValue, isSimulation && styles.connectedStatus]}
          >
            {connectionStatus}
          </Text>
        </View>
      </View>

      <View style={styles.controlSection}>
        <ControlButton
          label={COMMANDS.FORWARD.label}
          onPress={() => sendCommand(COMMANDS.FORWARD.label)}
          color={COMMANDS.FORWARD.color}
          disabled={!isSimulation}
        />

        <View style={styles.horizontalControls}>
          <ControlButton
            label={COMMANDS.LEFT.label}
            onPress={() => sendCommand(COMMANDS.LEFT.label)}
            color={COMMANDS.LEFT.color}
            disabled={!isSimulation}
          />
          <ControlButton
            label={COMMANDS.RIGHT.label}
            onPress={() => sendCommand(COMMANDS.RIGHT.label)}
            color={COMMANDS.RIGHT.color}
            disabled={!isSimulation}
          />
        </View>

        <ControlButton
          label={COMMANDS.BACKWARD.label}
          onPress={() => sendCommand(COMMANDS.BACKWARD.label)}
          color={COMMANDS.BACKWARD.color}
          disabled={!isSimulation}
        />

        <ControlButton
          label={COMMANDS.STOP.label}
          onPress={() => sendCommand(COMMANDS.STOP.label)}
          color={COMMANDS.STOP.color}
          disabled={!isSimulation}
        />
      </View>

      <View style={styles.logSection}>
        <Text style={styles.logTitle}>Histórico de Operações</Text>
        <ScrollView style={styles.logScroll}>
          {commandLog.map((cmd) => (
            <View
              key={cmd.id}
              style={[
                styles.logItem,
                cmd.status === "Erro" && styles.errorLog,
                cmd.status === "Sucesso" && styles.successLog,
              ]}
            >
              <View style={styles.logHeader}>
                <Text style={styles.logType}>{cmd.type}</Text>
                <Text style={styles.logTimestamp}>{cmd.timestamp}</Text>
              </View>
              <Text style={styles.logMessage}>{cmd.message}</Text>
              <Text style={styles.logStatus}>Status: {cmd.status}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusSection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    width: "40%",
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "58%",
  },
  batteryText: {
    marginLeft: 10,
    width: 60,
    textAlign: "right",
    color: "#333",
    fontSize: 16,
  },
  distanceValue: {
    fontSize: 16,
    color: "#FF9800",
    fontWeight: "bold",
  },
  speedValue: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "bold",
  },
  connectedStatus: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  controlSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
    width: 200,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  connectButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  connectedButton: {
    backgroundColor: "#4CAF50",
  },
  horizontalControls: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  logSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logItem: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ddd",
  },
  successLog: {
    borderLeftColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  errorLog: {
    borderLeftColor: "#f44336",
    backgroundColor: "#fff8f8",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  logType: {
    fontWeight: "bold",
    color: "#666",
  },
  logTimestamp: {
    color: "#999",
    fontSize: 12,
  },
  logMessage: {
    color: "#333",
    marginBottom: 3,
  },
  logStatus: {
    color: "#666",
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
