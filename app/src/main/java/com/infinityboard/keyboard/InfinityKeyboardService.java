package com.infinityboard.keyboard;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.inputmethodservice.InputMethodService;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputConnection;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

public class InfinityKeyboardService extends InputMethodService {

    private boolean isSymbols = false;
    private boolean isShifted = false;
    private LinearLayout keyboardContainer;

    @Override
    public View onCreateInputView() {
        keyboardContainer = new LinearLayout(this);
        keyboardContainer.setOrientation(LinearLayout.VERTICAL);
        keyboardContainer.setBackgroundColor(Color.parseColor("#0D0F14"));

        // Add ergonomic bottom padding to lift bottom row and reduce thumb strain
        float density = getResources().getDisplayMetrics().density;
        int bottomPadding = (int) (28 * density);
        keyboardContainer.setPadding(2, 6, 2, bottomPadding);

        // Increase height to 50% of screen height
        int height = (int) (getResources().getDisplayMetrics().heightPixels * 0.50f);
        keyboardContainer.setLayoutParams(new ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, height));

        renderKeyboard();
        return keyboardContainer;
    }

    private void renderKeyboard() {
        if (keyboardContainer == null) return;
        keyboardContainer.removeAllViews();

        if (isSymbols) {
            renderSymbols();
        } else {
            renderMainKeyboard();
        }
    }

    private void renderMainKeyboard() {
        // Top Row: Numbers (1 2 3 4 5 6 7 8 9 0)
        String[] rowNumbers = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"};
        keyboardContainer.addView(createRowLayout(rowNumbers, false));

        // Row 2: qwertyuiop (lowercase by default, hold to capitalize)
        String[] row1 = {"q", "w", "e", "r", "t", "y", "u", "i", "o", "p"};
        keyboardContainer.addView(createRowLayout(row1, true));

        // Row 3: asdfghjkl ? (swapped with backspace)
        String[] row2Letters = {"a", "s", "d", "f", "g", "h", "j", "k", "l"};
        LinearLayout row2Layout = new LinearLayout(this);
        row2Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row2Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row2Params.setMargins(0, 1, 0, 1);
        row2Layout.setLayoutParams(row2Params);

        for (String letter : row2Letters) {
            final String l = letter;
            Button btn = createKeyButton(isShifted ? l.toUpperCase() : l.toLowerCase(), false);
            btn.setOnClickListener(v -> handleLetterPress(l));
            btn.setOnLongClickListener(v -> {
                commitText(l.toUpperCase());
                return true;
            });
            row2Layout.addView(btn);
        }

        // ? Key at end of Row 2
        Button questionBtn = createKeyButton("?", false);
        questionBtn.setTextColor(Color.WHITE);
        questionBtn.setOnClickListener(v -> commitText("?"));
        row2Layout.addView(questionBtn);
        keyboardContainer.addView(row2Layout);

        // Row 3: ⇧ Shift key (replaces :), !, z x c v b n m, ⌫ Backspace (swapped with ?)
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3Params.setMargins(0, 1, 0, 1);
        row3Layout.setLayoutParams(row3Params);

        // Shift Key
        Button shiftBtn = createKeyButton("⇧", true);
        if (isShifted) {
            shiftBtn.setBackgroundColor(Color.parseColor("#1C2433"));
            shiftBtn.setTextColor(Color.parseColor("#38BDF8"));
        }
        shiftBtn.setOnClickListener(v -> {
            isShifted = !isShifted;
            renderKeyboard();
        });
        row3Layout.addView(shiftBtn);

        // ! Key
        Button exclamBtn = createKeyButton("!", false);
        exclamBtn.setTextColor(Color.WHITE);
        exclamBtn.setOnClickListener(v -> commitText("!"));
        row3Layout.addView(exclamBtn);

        // z x c v b n m
        String[] row3Letters = {"z", "x", "c", "v", "b", "n", "m"};
        for (String item : row3Letters) {
            final String it = item;
            Button btn = createKeyButton(isShifted ? it.toUpperCase() : it.toLowerCase(), false);
            btn.setOnClickListener(v -> handleLetterPress(it));
            btn.setOnLongClickListener(v -> {
                commitText(it.toUpperCase());
                return true;
            });
            row3Layout.addView(btn);
        }

        // Backspace key at the end of Row 3
        Button backspaceBtn = createKeyButton("⌫", true);
        LinearLayout.LayoutParams bsParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.3f);
        bsParams.setMargins(1, 0, 1, 0);
        backspaceBtn.setLayoutParams(bsParams);
        backspaceBtn.setOnClickListener(v -> deleteChar());
        row3Layout.addView(backspaceBtn);
        keyboardContainer.addView(row3Layout);

        // Row 4: Infinity Key (clean, no 123), comma, spacebar, period, Enter key
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.15f);
        row4Params.setMargins(0, 1, 0, 1);
        row4Layout.setLayoutParams(row4Params);

        // Clean Infinity Key (NO 123)
        Button infinityBtn = createKeyButton("∞", true);
        infinityBtn.setTextColor(Color.parseColor("#C084FC"));
        LinearLayout.LayoutParams infParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        infParams.setMargins(1, 0, 1, 0);
        infinityBtn.setLayoutParams(infParams);
        infinityBtn.setTextSize(24);
        infinityBtn.setOnClickListener(v -> {
            isSymbols = true;
            renderKeyboard();
        });
        row4Layout.addView(infinityBtn);

        // Comma
        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        commaP.setMargins(1, 0, 1, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        row4Layout.addView(commaBtn);

        // Spacebar
        Button spaceBtn = createKeyButton("", false);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.4f);
        spaceP.setMargins(1, 0, 1, 0);
        spaceBtn.setLayoutParams(spaceP);
        spaceBtn.setOnClickListener(v -> commitText(" "));
        row4Layout.addView(spaceBtn);

        // Period
        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        periodP.setMargins(1, 0, 1, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        row4Layout.addView(periodBtn);

        // Enter
        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        enterBtn.setBackgroundColor(Color.parseColor("#141824"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        enterP.setMargins(1, 0, 1, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        row4Layout.addView(enterBtn);

        keyboardContainer.addView(row4Layout);
    }

    private void renderSymbols() {
        // Row 1: Numbers (1 2 3 4 5 6 7 8 9 0) moved to symbol keyboard
        String[] row1Numbers = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"};
        keyboardContainer.addView(createRowLayout(row1Numbers, false));

        // Row 2: tab key > / : " ~ ' ; \ <
        String[] row2Syms = {">", "/", ":", "\"", "~", "'", ";", "\\", "<"};
        LinearLayout row2Layout = new LinearLayout(this);
        row2Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row2P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row2P.setMargins(0, 1, 0, 1);
        row2Layout.setLayoutParams(row2P);

        Button tabBtn = createKeyButton("Tab", true);
        LinearLayout.LayoutParams tabP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        tabP.setMargins(1, 0, 1, 0);
        tabBtn.setLayoutParams(tabP);
        tabBtn.setTextSize(13);
        tabBtn.setOnClickListener(v -> commitText("    "));
        row2Layout.addView(tabBtn);

        for (String s : row2Syms) {
            Button btn = createKeyButton(s, false);
            btn.setOnClickListener(v -> commitText(s));
            row2Layout.addView(btn);
        }
        keyboardContainer.addView(row2Layout);

        // Row 3: * @ [ ♥ = ∞ ] ★ & followed by backspace
        String[] row3Syms = {"*", "@", "[", "♥", "=", "∞", "]", "★", "&"};
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3P.setMargins(0, 1, 0, 1);
        row3Layout.setLayoutParams(row3P);

        for (String s : row3Syms) {
            Button btn = createKeyButton(s, false);
            if (s.equals("♥")) btn.setTextColor(Color.parseColor("#F43F5E"));
            if (s.equals("★")) btn.setTextColor(Color.parseColor("#FBBF24"));
            if (s.equals("∞")) btn.setTextColor(Color.parseColor("#38BDF8"));
            btn.setOnClickListener(v -> commitText(s));
            row3Layout.addView(btn);
        }

        Button backspaceBtn = createKeyButton("⌫", true);
        LinearLayout.LayoutParams bsP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        bsP.setMargins(1, 0, 1, 0);
        backspaceBtn.setLayoutParams(bsP);
        backspaceBtn.setOnClickListener(v -> deleteChar());
        row3Layout.addView(backspaceBtn);
        keyboardContainer.addView(row3Layout);

        // Row 4: $ ( + - # ÷ x ) %
        String[] row4Syms = {"$", "(", "+", "-", "#", "÷", "x", ")", "%"};
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row4P.setMargins(0, 1, 0, 1);
        row4Layout.setLayoutParams(row4P);
        row4Layout.setPadding(24, 0, 24, 0);

        for (String s : row4Syms) {
            Button btn = createKeyButton(s, false);
            btn.setOnClickListener(v -> commitText(s));
            row4Layout.addView(btn);
        }
        keyboardContainer.addView(row4Layout);

        // Row 5: ABC key, Comma, Space, Period, Enter
        LinearLayout row5Layout = new LinearLayout(this);
        row5Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row5P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.15f);
        row5P.setMargins(0, 1, 0, 1);
        row5Layout.setLayoutParams(row5P);

        Button abcBtn = createKeyButton("ABC", true);
        abcBtn.setTextColor(Color.parseColor("#38BDF8"));
        LinearLayout.LayoutParams abcP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        abcP.setMargins(1, 0, 1, 0);
        abcBtn.setLayoutParams(abcP);
        abcBtn.setTextSize(14);
        abcBtn.setOnClickListener(v -> {
            isSymbols = false;
            renderKeyboard();
        });
        row5Layout.addView(abcBtn);

        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        commaP.setMargins(1, 0, 1, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        row5Layout.addView(commaBtn);

        Button spaceBtn = createKeyButton("", false);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.4f);
        spaceP.setMargins(1, 0, 1, 0);
        spaceBtn.setLayoutParams(spaceP);
        spaceBtn.setOnClickListener(v -> commitText(" "));
        row5Layout.addView(spaceBtn);

        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        periodP.setMargins(1, 0, 1, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        row5Layout.addView(periodBtn);

        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        enterBtn.setBackgroundColor(Color.parseColor("#141824"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        enterP.setMargins(1, 0, 1, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        row5Layout.addView(enterBtn);

        keyboardContainer.addView(row5Layout);
    }

    private LinearLayout createRowLayout(String[] keys, boolean isAlpha) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        params.setMargins(0, 1, 0, 1);
        row.setLayoutParams(params);

        for (String k : keys) {
            final String text = k;
            Button btn = createKeyButton(isAlpha && isShifted ? text.toUpperCase() : text.toLowerCase(), false);
            btn.setOnClickListener(v -> {
                if (isAlpha) handleLetterPress(text);
                else commitText(text);
            });
            if (isAlpha) {
                btn.setOnLongClickListener(v -> {
                    commitText(text.toUpperCase());
                    return true;
                });
            }
            row.addView(btn);
        }
        return row;
    }

    private void handleLetterPress(String letter) {
        commitText(isShifted ? letter.toUpperCase() : letter.toLowerCase());
        if (isShifted) {
            isShifted = false;
            renderKeyboard();
        }
    }

    private Button createKeyButton(String text, boolean isSpecial) {
        Button btn = new Button(this);
        btn.setText(text);
        btn.setTextColor(Color.WHITE);
        btn.setTextSize(20);
        btn.setTypeface(Typeface.DEFAULT_BOLD);
        btn.setBackgroundColor(isSpecial ? Color.parseColor("#15171D") : Color.parseColor("#20222A"));
        btn.setPadding(0, 0, 0, 0);

        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        p.setMargins(1, 0, 1, 0);
        btn.setLayoutParams(p);
        return btn;
    }

    private void commitText(String text) {
        InputConnection ic = getCurrentInputConnection();
        if (ic != null) {
            ic.commitText(text, 1);
        }
    }

    private void deleteChar() {
        InputConnection ic = getCurrentInputConnection();
        if (ic != null) {
            ic.deleteSurroundingText(1, 0);
        }
    }
}
