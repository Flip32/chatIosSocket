import SwiftUI
import SocketIO

struct ContentView: View {
    @State private var message = ""
    @State private var messages: [ChatMessage] = []
    
    let socket: SocketManager
    let socketIOClient: SocketIOClient
    
    init() {
        // Inicialize o socket e o socketIOClient dentro do inicializador
        socket = SocketManager(socketURL: URL(string: "https://6ff8-2804-d59-a610-d000-5429-28a2-5ca7-7cb4.ngrok-free.app")!, config: [.log(true), .compress])
        socketIOClient = socket.defaultSocket
    }
    
    var body: some View {
        VStack {
            List(messages) { chat in
                Text(chat.sender == "Player 1" ? "Player 1: \(chat.text)" : "Player 2: \(chat.text)")
            }
            
            HStack {
                TextField("Digite sua mensagem", text: $message)
                Button(action: sendMessage) {
                    Text("Enviar")
                }
            }
        }
        .padding()
        .onAppear(perform: connectToServer)
    }
    
    func sendMessage() {
        messages.append(ChatMessage(text: message, sender: "Player 1"))
        socketIOClient.emit("chat message", message)
        message = ""
    }
    
    func connectToServer() {
        socketIOClient.on("chat message") { data, _ in
            if let messageData = data[0] as? [String: Any],
               let text = messageData["text"] as? String {
                DispatchQueue.main.async {
                    let newMessage = ChatMessage(text: text, sender: "Player 2")
                    messages.append(newMessage)
                }
            }
        }
        socketIOClient.connect()
    }
}

struct ChatMessage: Identifiable {
    let id = UUID()
    let text: String
    let sender: String
}
