package com.onyxkey.keyboard

import android.inputmethodservice.InputMethodService
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputConnection

class OnyxKeyboardService : InputMethodService() {

    override fun onCreateInputView(): View {
        // Returns the 1/3 viewport high-contrast keyboard overlay view
        return OnyxKeyboardView(this)
    }

    override fun onStartInput(attribute: EditorInfo?, restarting: Boolean) {
        super.onStartInput(attribute, restarting)
    }

    fun handleKeyPress(code: String) {
        val ic: InputConnection? = currentInputConnection ?: return
        when (code) {
            "DELETE" -> ic.deleteSurroundingText(1, 0)
            "ENTER" -> sendKeyChar('\n')
            "TAB" -> ic.commitText("    ", 1)
            "SPACE" -> ic.commitText(" ", 1)
            else -> ic.commitText(code, 1)
        }
    }
}
