import UserNotifications

class NotificationService: UNNotificationServiceExtension {
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        guard let bestAttemptContent = bestAttemptContent else {
            contentHandler(request.content)
            return
        }

        let sender = request.content.userInfo["sender"] as? String ?? "Unknown"
        let message = bestAttemptContent.body

        getAIReply(sender: sender, message: message) { draftReply in
            if let reply = draftReply {
                bestAttemptContent.body = "\(message)\n\nSuggested reply: \(reply)"
            }
            contentHandler(bestAttemptContent)
        }
    }

    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }

    private func getAIReply(sender: String, message: String, completion: @escaping (String?) -> Void) {
        let url = URL(string: "https://silentmode-api.vercel.app/api/draft-reply")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10        let body: [String: Any] = ["sender": sender, "incomingText": message, "platform": "ios"]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data,
                  let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let draft = json["draft"] as? String else {
                completion(nil)
                return
            }
            completion(draft)
        }.resume()
    }
}