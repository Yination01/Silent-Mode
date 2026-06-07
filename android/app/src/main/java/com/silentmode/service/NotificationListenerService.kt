package com.silentmode.service

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationListenerService : NotificationListenerService() {

    private val TARGET_PACKAGES = listOf("com.whatsapp", "com.google.android.gm", "com.google.android.apps.messaging")

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName !in TARGET_PACKAGES) return
        val notification = sbn.notification
        val extras = notification.extras
        val sender = extras.getString(Notification.EXTRA_TITLE) ?: "Unknown"
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        if (text.isNotEmpty()) {
            lastNotification = NotificationData(sender, text, sbn.packageName)
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}

    data class NotificationData(val sender: String, val text: String, val platform: String)

    companion object {
        var lastNotification: NotificationData? = null
        val pendingNotifications = mutableListOf<NotificationData>()

        fun onReactNativeReady() {
            pendingNotifications.forEach { notification ->
                // Emit to React Native when ready
            }
            pendingNotifications.clear()
        }
    }
}