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
        keyboardContainer.setBackgroundColor(Color.parseColor("#090B10"));
        keyboardContainer.setPadding(4, 8, 4, 12);

        int height = (int) (getResources().getDisplayMetrics().heightPixels * 0.40f);
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
        // Row 1: 1234567890
        String[] row1 = {"1", "2", "3", "4", "5", "6", "7", "8", "9", "0"};
        keyboardContainer.addView(createRowLayout(row1, false));

        // Row 2: qwertyuiop (lowercase by default, hold to capitalize)
        String[] row2 = {"q", "w", "e", "r", "t", "y", "u", "i", "o", "p"};
        keyboardContainer.addView(createRowLayout(row2, true));

        // Row 3: asdfghjkl + backspace
        String[] row3Letters = {"a", "s", "d", "f", "g", "h", "j", "k", "l"};
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3Params.setMargins(0, 2, 0, 2);
        row3Layout.setLayoutParams(row3Params);

        for (String letter : row3Letters) {
            final String l = letter;
            Button btn = createKeyButton(isShifted ? l.toUpperCase() : l.toLowerCase(), false);
            btn.setOnClickListener(v -> handleLetterPress(l));
            btn.setOnLongClickListener(v -> {
                commitText(l.toUpperCase());
                return true;
            });
            row3Layout.addView(btn);
        }

        // Backspace key on Row 3
        Button backspaceBtn = createKeyButton("⌫", true);
        LinearLayout.LayoutParams bsParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        bsParams.setMargins(2, 0, 2, 0);
        backspaceBtn.setLayoutParams(bsParams);
        backspaceBtn.setOnClickListener(v -> deleteChar());
        row3Layout.addView(backspaceBtn);
        keyboardContainer.addView(row3Layout);

        // Row 4: : ! z x c v b n m ?
        String[] row4 = {":", "!", "z", "x", "c", "v", "b", "n", "m", "?"};
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row4Params.setMargins(0, 2, 0, 2);
        row4Layout.setLayoutParams(row4Params);

        for (String item : row4) {
            final String it = item;
            boolean isAlpha = Character.isLetter(it.charAt(0));
            Button btn = createKeyButton(isAlpha && isShifted ? it.toUpperCase() : it.toLowerCase(), !isAlpha);
            btn.setOnClickListener(v -> {
                if (isAlpha) handleLetterPress(it);
                else commitText(it);
            });
            if (isAlpha) {
                btn.setOnLongClickListener(v -> {
                    commitText(it.toUpperCase());
                    return true;
                });
            }
            row4Layout.addView(btn);
        }
        keyboardContainer.addView(row4Layout);

        // Row 5: Infinity Key, comma, spacebar, period, Enter key
        LinearLayout row5Layout = new LinearLayout(this);
        row5Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row5Params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.1f);
        row5Params.setMargins(0, 2, 0, 2);
        row5Layout.setLayoutParams(row5Params);

        // Infinity Key (colored text blue/pink)
        Button infinityBtn = createKeyButton("∞", true);
        infinityBtn.setTextColor(Color.parseColor("#38BDF8"));
        LinearLayout.LayoutParams infParams = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        infParams.setMargins(2, 0, 2, 0);
        infinityBtn.setLayoutParams(infParams);
        infinityBtn.setTextSize(22);
        infinityBtn.setOnClickListener(v -> {
            isSymbols = true;
            renderKeyboard();
        });
        row5Layout.addView(infinityBtn);

        // Comma
        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        commaP.setMargins(2, 0, 2, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        row5Layout.addView(commaBtn);

        // Spacebar (clean, no word 'space')
        Button spaceBtn = createKeyButton("", false);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.4f);
        spaceP.setMargins(2, 0, 2, 0);
        spaceBtn.setLayoutParams(spaceP);
        spaceBtn.setOnClickListener(v -> commitText(" "));
        row5Layout.addView(spaceBtn);

        // Period
        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        periodP.setMargins(2, 0, 2, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        row5Layout.addView(periodBtn);

        // Enter
        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        enterBtn.setBackgroundColor(Color.parseColor("#0C4A6E"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        enterP.setMargins(2, 0, 2, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        row5Layout.addView(enterBtn);

        keyboardContainer.addView(row5Layout);
    }

    private void renderSymbols() {
        // Row 1: tab key > / : " ~ ' ; \ <
        String[] row1Syms = {">", "/", ":", "\"", "~", "'", ";", "\\", "<"};
        LinearLayout row1Layout = new LinearLayout(this);
        row1Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row1P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row1P.setMargins(0, 2, 0, 2);
        row1Layout.setLayoutParams(row1P);

        Button tabBtn = createKeyButton("Tab", true);
        LinearLayout.LayoutParams tabP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        tabP.setMargins(2, 0, 2, 0);
        tabBtn.setLayoutParams(tabP);
        tabBtn.setTextSize(13);
        tabBtn.setOnClickListener(v -> commitText("    "));
        row1Layout.addView(tabBtn);

        for (String s : row1Syms) {
            Button btn = createKeyButton(s, false);
            btn.setOnClickListener(v -> commitText(s));
            row1Layout.addView(btn);
        }
        keyboardContainer.addView(row1Layout);

        // Row 2: * @ [ ♥ = ∞ ] ★ & followed by backspace
        String[] row2Syms = {"*", "@", "[", "♥", "=", "∞", "]", "★", "&"};
        LinearLayout row2Layout = new LinearLayout(this);
        row2Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row2P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row2P.setMargins(0, 2, 0, 2);
        row2Layout.setLayoutParams(row2P);

        for (String s : row2Syms) {
            Button btn = createKeyButton(s, false);
            if (s.equals("♥")) btn.setTextColor(Color.parseColor("#F43F5E"));
            if (s.equals("★")) btn.setTextColor(Color.parseColor("#FBBF24"));
            if (s.equals("∞")) btn.setTextColor(Color.parseColor("#38BDF8"));
            btn.setOnClickListener(v -> commitText(s));
            row2Layout.addView(btn);
        }

        Button backspaceBtn = createKeyButton("⌫", true);
        LinearLayout.LayoutParams bsP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.4f);
        bsP.setMargins(2, 0, 2, 0);
        backspaceBtn.setLayoutParams(bsP);
        backspaceBtn.setOnClickListener(v -> deleteChar());
        row2Layout.addView(backspaceBtn);
        keyboardContainer.addView(row2Layout);

        // Row 3: $ ( + - # ÷ x ) %
        String[] row3Syms = {"$", "(", "+", "-", "#", "÷", "x", ")", "%"};
        LinearLayout row3Layout = new LinearLayout(this);
        row3Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row3P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        row3P.setMargins(0, 2, 0, 2);
        row3Layout.setLayoutParams(row3P);
        row3Layout.setPadding(24, 0, 24, 0);

        for (String s : row3Syms) {
            Button btn = createKeyButton(s, false);
            btn.setOnClickListener(v -> commitText(s));
            row3Layout.addView(btn);
        }
        keyboardContainer.addView(row3Layout);

        // Row 4: ABC key (where infinity key was on main keyboard), Comma, Space, Period, Enter
        LinearLayout row4Layout = new LinearLayout(this);
        row4Layout.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams row4P = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.1f);
        row4P.setMargins(0, 2, 0, 2);
        row4Layout.setLayoutParams(row4P);

        Button abcBtn = createKeyButton("ABC", true);
        abcBtn.setTextColor(Color.parseColor("#38BDF8"));
        LinearLayout.LayoutParams abcP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        abcP.setMargins(2, 0, 2, 0);
        abcBtn.setLayoutParams(abcP);
        abcBtn.setTextSize(14);
        abcBtn.setOnClickListener(v -> {
            isSymbols = false;
            renderKeyboard();
        });
        row4Layout.addView(abcBtn);

        Button commaBtn = createKeyButton(",", false);
        LinearLayout.LayoutParams commaP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        commaP.setMargins(2, 0, 2, 0);
        commaBtn.setLayoutParams(commaP);
        commaBtn.setOnClickListener(v -> commitText(","));
        row4Layout.addView(commaBtn);

        Button spaceBtn = createKeyButton("", false);
        LinearLayout.LayoutParams spaceP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 5.4f);
        spaceP.setMargins(2, 0, 2, 0);
        spaceBtn.setLayoutParams(spaceP);
        spaceBtn.setOnClickListener(v -> commitText(" "));
        row4Layout.addView(spaceBtn);

        Button periodBtn = createKeyButton(".", false);
        LinearLayout.LayoutParams periodP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.1f);
        periodP.setMargins(2, 0, 2, 0);
        periodBtn.setLayoutParams(periodP);
        periodBtn.setOnClickListener(v -> commitText("."));
        row4Layout.addView(periodBtn);

        Button enterBtn = createKeyButton("↵", true);
        enterBtn.setTextColor(Color.parseColor("#38BDF8"));
        enterBtn.setBackgroundColor(Color.parseColor("#0C4A6E"));
        LinearLayout.LayoutParams enterP = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.5f);
        enterP.setMargins(2, 0, 2, 0);
        enterBtn.setLayoutParams(enterP);
        enterBtn.setOnClickListener(v -> sendKeyChar('\n'));
        row4Layout.addView(enterBtn);

        keyboardContainer.addView(row4Layout);
    }

    private LinearLayout createRowLayout(String[] keys, boolean isAlpha) {
        LinearLayout row = new LinearLayout(this);
        row.setOrientation(LinearLayout.HORIZONTAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1.0f);
        params.setMargins(0, 2, 0, 2);
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
        btn.setTextSize(18);
        btn.setTypeface(Typeface.DEFAULT_BOLD);
        btn.setBackgroundColor(isSpecial ? Color.parseColor("#181A22") : Color.parseColor("#252834"));
        btn.setPadding(0, 0, 0, 0);

        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1.0f);
        p.setMargins(2, 0, 2, 0);
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
