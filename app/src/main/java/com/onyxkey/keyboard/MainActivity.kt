package com.onyxkey.keyboard

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(48, 64, 48, 64)
            setBackgroundColor(0xFF090B10.toInt())
        }

        val title = TextView(this).apply {
            text = "OnyxKey Keyboard"
            textSize = 24f
            setTextColor(0xFFFFFFFF.toInt())
            setPadding(0, 0, 0, 32)
        }
        layout.addView(title)

        val desc = TextView(this).apply {
            text = "High-contrast dark mode keyboard. To start using OnyxKey, enable it in your device input settings."
            textSize = 15f
            setTextColor(0xFF94A3B8.toInt())
            setPadding(0, 0, 0, 48)
        }
        layout.addView(desc)

        val enableBtn = Button(this).apply {
            text = "1. Enable OnyxKey in Settings"
            setOnClickListener {
                startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
            }
        }
        layout.addView(enableBtn)

        val selectBtn = Button(this).apply {
            text = "2. Select OnyxKey Input Method"
            setOnClickListener {
                val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                imm.showInputMethodPicker()
            }
        }
        layout.addView(selectBtn)

        setContentView(layout)
    }
}
