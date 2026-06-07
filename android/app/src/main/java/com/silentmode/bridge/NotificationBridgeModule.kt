package com.silentmode.bridge

import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class NotificationBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "NotificationBridge"

    private var eventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter? =
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)

    @ReactMethod
    fun startNotificationListener(promise: Promise) {
        val context = reactApplicationContext
        if (!isNotificationListenerEnabled(context)) {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            promise.resolve(false)
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestPermission(promise: Promise) {
        val enabled = isNotificationListenerEnabled(reactApplicationContext)
        promise.resolve(enabled)
    }

    @ReactMethod
    fun sendDraftToReactNative(sender: String?, text: String?, platform: String?) {
        val params = Arguments.createMap().apply {
            putString("sender", sender)
            putString("text", text)
            putString("platform", platform)
        }
        eventEmitter?.emit("onNotificationReceived", params)
    }

    private fun isNotificationListenerEnabled(context: Context): Boolean {
        val enabledListeners = Settings.Secure.getString(
            context.contentResolver, "enabled_notification_listeners"
        )
        return enabledListeners?.contains(context.packageName) == true
    }

    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}