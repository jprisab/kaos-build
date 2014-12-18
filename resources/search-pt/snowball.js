/*!
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

function Snowball(lng) {
    function Among(s, substring_i, result, method) {
        this.s_size = s.length;
        this.s = this.toCharArray(s);
        this.substring_i = substring_i;
        this.result = result;
        this.method = method;
    }
    Among.prototype.toCharArray = function(s) {
        var sLength = s.length, charArr = new Array(sLength);
        for (var i = 0; i < sLength; i++)
            charArr[i] = s.charCodeAt(i);
        return charArr;
    }
    function SnowballProgram() {
        var current;
        return {
            b : 0,
            k : 0,
            l : 0,
            c : 0,
            lb : 0,
            s_c : function(word) {
                current = word;
                this.c = 0;
                this.l = word.length;
                this.lb = 0;
                this.b = this.c;
                this.k = this.l;
            },
            g_c : function() {
                var result = current;
                current = null;
                return result;
            },
            i_g : function(s, min, max) {
                if (this.c < this.l) {
                    var ch = current.charCodeAt(this.c);
                    if (ch <= max && ch >= min) {
                        ch -= min;
                        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                            this.c++;
                            return true;
                        }
                    }
                }
                return false;
            },
            i_g_b : function(s, min, max) {
                if (this.c > this.lb) {
                    var ch = current.charCodeAt(this.c - 1);
                    if (ch <= max && ch >= min) {
                        ch -= min;
                        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
                            this.c--;
                            return true;
                        }
                    }
                }
                return false;
            },
            o_g : function(s, min, max) {
                if (this.c < this.l) {
                    var ch = current.charCodeAt(this.c);
                    if (ch > max || ch < min) {
                        this.c++;
                        return true;
                    }
                    ch -= min;
                    if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                        this.c++;
                        return true;
                    }
                }
                return false;
            },
            o_g_b : function(s, min, max) {
                if (this.c > this.lb) {
                    var ch = current.charCodeAt(this.c - 1);
                    if (ch > max || ch < min) {
                        this.c--;
                        return true;
                    }
                    ch -= min;
                    if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
                        this.c--;
                        return true;
                    }
                }
                return false;
            },
            e_s : function(s_size, s) {
                if (this.l - this.c < s_size)
                    return false;
                for (var i = 0; i < s_size; i++)
                    if (current.charCodeAt(this.c + i) != s.charCodeAt(i))
                        return false;
                this.c += s_size;
                return true;
            },
            e_s_b : function(s_size, s) {
                if (this.c - this.lb < s_size)
                    return false;
                for (var i = 0; i < s_size; i++)
                    if (current.charCodeAt(this.c - s_size + i) != s
                            .charCodeAt(i))
                        return false;
                this.c -= s_size;
                return true;
            },
            f_a : function(v, v_size) {
                var i = 0, j = v_size, c = this.c, l = this.l, common_i = 0, common_j = 0, first_key_inspected = false;
                while (true) {
                    var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
                            ? common_i
                            : common_j, w = v[k];
                    for (var i2 = common; i2 < w.s_size; i2++) {
                        if (c + common == l) {
                            diff = -1;
                            break;
                        }
                        diff = current.charCodeAt(c + common) - w.s[i2];
                        if (diff)
                            break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0 || j == i || first_key_inspected)
                            break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var w = v[i];
                    if (common_i >= w.s_size) {
                        this.c = c + w.s_size;
                        if (!w.method)
                            return w.result;
                        var res = w.method();
                        this.c = c + w.s_size;
                        if (res)
                            return w.result;
                    }
                    i = w.substring_i;
                    if (i < 0)
                        return 0;
                }
            },
            f_a_b : function(v, v_size) {
                var i = 0, j = v_size, c = this.c, lb = this.lb, common_i = 0, common_j = 0, first_key_inspected = false;
                while (true) {
                    var k = i + ((j - i) >> 1), diff = 0, common = common_i < common_j
                            ? common_i
                            : common_j, w = v[k];
                    for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
                        if (c - common == lb) {
                            diff = -1;
                            break;
                        }
                        diff = current.charCodeAt(c - 1 - common) - w.s[i2];
                        if (diff)
                            break;
                        common++;
                    }
                    if (diff < 0) {
                        j = k;
                        common_j = common;
                    } else {
                        i = k;
                        common_i = common;
                    }
                    if (j - i <= 1) {
                        if (i > 0 || j == i || first_key_inspected)
                            break;
                        first_key_inspected = true;
                    }
                }
                while (true) {
                    var w = v[i];
                    if (common_i >= w.s_size) {
                        this.c = c - w.s_size;
                        if (!w.method)
                            return w.result;
                        var res = w.method();
                        this.c = c - w.s_size;
                        if (res)
                            return w.result;
                    }
                    i = w.substring_i;
                    if (i < 0)
                        return 0;
                }
            },
            r_s : function(c_bra, c_ket, s) {
                var adjustment = s.length - (c_ket - c_bra), left = current
                        .substring(0, c_bra), right = current.substring(c_ket);
                current = left + s + right;
                this.l += adjustment;
                if (this.c >= c_ket)
                    this.c += adjustment;
                else if (this.c > c_bra)
                    this.c = c_bra;
                return adjustment;
            },
            s_ch : function() {
                if (this.b < 0 || this.b > this.k || this.k > this.l
                        || this.l > current.length)
                    throw ("faulty slice operation");
            },
            s_f : function(s) {
                this.s_ch();
                this.r_s(this.b, this.k, s);
            },
            s_d : function() {
                this.s_f("");
            },
            i_ : function(c_bra, c_ket, s) {
                var adjustment = this.r_s(c_bra, c_ket, s);
                if (c_bra <= this.b)
                    this.b += adjustment;
                if (c_bra <= this.k)
                    this.k += adjustment;
            },
            s_t : function() {
                this.s_ch();
                return current.substring(this.b, this.k);
            },
            e_v_b : function(s) {
                return this.e_s_b(s.length, s);
            }
        };
    }
    var stemFactory = {
            PortugueseStemmer : function() {
                    var a_0 = [new Among("", -1, 3), new Among("\u00E3", 0, 1),
                                    new Among("\u00F5", 0, 2)], a_1 = [new Among("", -1, 3),
                                    new Among("a~", 0, 1), new Among("o~", 0, 2)], a_2 = [
                                    new Among("ic", -1, -1), new Among("ad", -1, -1),
                                    new Among("os", -1, -1), new Among("iv", -1, 1)], a_3 = [
                                    new Among("ante", -1, 1), new Among("avel", -1, 1),
                                    new Among("\u00EDvel", -1, 1)], a_4 = [
                                    new Among("ic", -1, 1), new Among("abil", -1, 1),
                                    new Among("iv", -1, 1)], a_5 = [new Among("ica", -1, 1),
                                    new Among("\u00E2ncia", -1, 1),
                                    new Among("\u00EAncia", -1, 4), new Among("ira", -1, 9),
                                    new Among("adora", -1, 1), new Among("osa", -1, 1),
                                    new Among("ista", -1, 1), new Among("iva", -1, 8),
                                    new Among("eza", -1, 1), new Among("log\u00EDa", -1, 2),
                                    new Among("idade", -1, 7), new Among("ante", -1, 1),
                                    new Among("mente", -1, 6), new Among("amente", 12, 5),
                                    new Among("\u00E1vel", -1, 1),
                                    new Among("\u00EDvel", -1, 1),
                                    new Among("uci\u00F3n", -1, 3), new Among("ico", -1, 1),
                                    new Among("ismo", -1, 1), new Among("oso", -1, 1),
                                    new Among("amento", -1, 1), new Among("imento", -1, 1),
                                    new Among("ivo", -1, 8), new Among("a\u00E7a~o", -1, 1),
                                    new Among("ador", -1, 1), new Among("icas", -1, 1),
                                    new Among("\u00EAncias", -1, 4), new Among("iras", -1, 9),
                                    new Among("adoras", -1, 1), new Among("osas", -1, 1),
                                    new Among("istas", -1, 1), new Among("ivas", -1, 8),
                                    new Among("ezas", -1, 1), new Among("log\u00EDas", -1, 2),
                                    new Among("idades", -1, 7), new Among("uciones", -1, 3),
                                    new Among("adores", -1, 1), new Among("antes", -1, 1),
                                    new Among("a\u00E7o~es", -1, 1), new Among("icos", -1, 1),
                                    new Among("ismos", -1, 1), new Among("osos", -1, 1),
                                    new Among("amentos", -1, 1), new Among("imentos", -1, 1),
                                    new Among("ivos", -1, 8)], a_6 = [new Among("ada", -1, 1),
                                    new Among("ida", -1, 1), new Among("ia", -1, 1),
                                    new Among("aria", 2, 1), new Among("eria", 2, 1),
                                    new Among("iria", 2, 1), new Among("ara", -1, 1),
                                    new Among("era", -1, 1), new Among("ira", -1, 1),
                                    new Among("ava", -1, 1), new Among("asse", -1, 1),
                                    new Among("esse", -1, 1), new Among("isse", -1, 1),
                                    new Among("aste", -1, 1), new Among("este", -1, 1),
                                    new Among("iste", -1, 1), new Among("ei", -1, 1),
                                    new Among("arei", 16, 1), new Among("erei", 16, 1),
                                    new Among("irei", 16, 1), new Among("am", -1, 1),
                                    new Among("iam", 20, 1), new Among("ariam", 21, 1),
                                    new Among("eriam", 21, 1), new Among("iriam", 21, 1),
                                    new Among("aram", 20, 1), new Among("eram", 20, 1),
                                    new Among("iram", 20, 1), new Among("avam", 20, 1),
                                    new Among("em", -1, 1), new Among("arem", 29, 1),
                                    new Among("erem", 29, 1), new Among("irem", 29, 1),
                                    new Among("assem", 29, 1), new Among("essem", 29, 1),
                                    new Among("issem", 29, 1), new Among("ado", -1, 1),
                                    new Among("ido", -1, 1), new Among("ando", -1, 1),
                                    new Among("endo", -1, 1), new Among("indo", -1, 1),
                                    new Among("ara~o", -1, 1), new Among("era~o", -1, 1),
                                    new Among("ira~o", -1, 1), new Among("ar", -1, 1),
                                    new Among("er", -1, 1), new Among("ir", -1, 1),
                                    new Among("as", -1, 1), new Among("adas", 47, 1),
                                    new Among("idas", 47, 1), new Among("ias", 47, 1),
                                    new Among("arias", 50, 1), new Among("erias", 50, 1),
                                    new Among("irias", 50, 1), new Among("aras", 47, 1),
                                    new Among("eras", 47, 1), new Among("iras", 47, 1),
                                    new Among("avas", 47, 1), new Among("es", -1, 1),
                                    new Among("ardes", 58, 1), new Among("erdes", 58, 1),
                                    new Among("irdes", 58, 1), new Among("ares", 58, 1),
                                    new Among("eres", 58, 1), new Among("ires", 58, 1),
                                    new Among("asses", 58, 1), new Among("esses", 58, 1),
                                    new Among("isses", 58, 1), new Among("astes", 58, 1),
                                    new Among("estes", 58, 1), new Among("istes", 58, 1),
                                    new Among("is", -1, 1), new Among("ais", 71, 1),
                                    new Among("eis", 71, 1), new Among("areis", 73, 1),
                                    new Among("ereis", 73, 1), new Among("ireis", 73, 1),
                                    new Among("\u00E1reis", 73, 1),
                                    new Among("\u00E9reis", 73, 1),
                                    new Among("\u00EDreis", 73, 1),
                                    new Among("\u00E1sseis", 73, 1),
                                    new Among("\u00E9sseis", 73, 1),
                                    new Among("\u00EDsseis", 73, 1),
                                    new Among("\u00E1veis", 73, 1),
                                    new Among("\u00EDeis", 73, 1),
                                    new Among("ar\u00EDeis", 84, 1),
                                    new Among("er\u00EDeis", 84, 1),
                                    new Among("ir\u00EDeis", 84, 1), new Among("ados", -1, 1),
                                    new Among("idos", -1, 1), new Among("amos", -1, 1),
                                    new Among("\u00E1ramos", 90, 1),
                                    new Among("\u00E9ramos", 90, 1),
                                    new Among("\u00EDramos", 90, 1),
                                    new Among("\u00E1vamos", 90, 1),
                                    new Among("\u00EDamos", 90, 1),
                                    new Among("ar\u00EDamos", 95, 1),
                                    new Among("er\u00EDamos", 95, 1),
                                    new Among("ir\u00EDamos", 95, 1), new Among("emos", -1, 1),
                                    new Among("aremos", 99, 1), new Among("eremos", 99, 1),
                                    new Among("iremos", 99, 1),
                                    new Among("\u00E1ssemos", 99, 1),
                                    new Among("\u00EAssemos", 99, 1),
                                    new Among("\u00EDssemos", 99, 1), new Among("imos", -1, 1),
                                    new Among("armos", -1, 1), new Among("ermos", -1, 1),
                                    new Among("irmos", -1, 1), new Among("\u00E1mos", -1, 1),
                                    new Among("ar\u00E1s", -1, 1),
                                    new Among("er\u00E1s", -1, 1),
                                    new Among("ir\u00E1s", -1, 1), new Among("eu", -1, 1),
                                    new Among("iu", -1, 1), new Among("ou", -1, 1),
                                    new Among("ar\u00E1", -1, 1), new Among("er\u00E1", -1, 1),
                                    new Among("ir\u00E1", -1, 1)], a_7 = [
                                    new Among("a", -1, 1), new Among("i", -1, 1),
                                    new Among("o", -1, 1), new Among("os", -1, 1),
                                    new Among("\u00E1", -1, 1), new Among("\u00ED", -1, 1),
                                    new Among("\u00F3", -1, 1)], a_8 = [new Among("e", -1, 1),
                                    new Among("\u00E7", -1, 2), new Among("\u00E9", -1, 1),
                                    new Among("\u00EA", -1, 1)], g_v = [17, 65, 16, 0, 0, 0, 0,
                                    0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 19, 12, 2], I_p2, I_p1, I_pV, sbp = new SnowballProgram();
                    this.setCurrent = function(word) {
                            sbp.s_c(word);
                    };
                    this.getCurrent = function() {
                            return sbp.g_c();
                    };
                    function r_prelude() {
                            var a_v;
                            while (true) {
                                    sbp.b = sbp.c;
                                    a_v = sbp.f_a(a_0, 3);
                                    if (a_v) {
                                            sbp.k = sbp.c;
                                            switch (a_v) {
                                                    case 1 :
                                                            sbp.s_f("a~");
                                                            continue;
                                                    case 2 :
                                                            sbp.s_f("o~");
                                                            continue;
                                                    case 3 :
                                                            if (sbp.c >= sbp.l)
                                                                    break;
                                                            sbp.c++;
                                                            continue;
                                            }
                                    }
                                    break;
                            }
                    }
                    function habr2() {
                            if (sbp.o_g(g_v, 97, 250)) {
                                    while (!sbp.i_g(g_v, 97, 250)) {
                                            if (sbp.c >= sbp.l)
                                                    return true;
                                            sbp.c++;
                                    }
                                    return false;
                            }
                            return true;
                    }
                    function habr3() {
                            if (sbp.i_g(g_v, 97, 250)) {
                                    while (!sbp.o_g(g_v, 97, 250)) {
                                            if (sbp.c >= sbp.l)
                                                    return false;
                                            sbp.c++;
                                    }
                            }
                            I_pV = sbp.c;
                            return true;
                    }
                    function habr4() {
                            var v_1 = sbp.c, v_2, v_3;
                            if (sbp.i_g(g_v, 97, 250)) {
                                    v_2 = sbp.c;
                                    if (habr2()) {
                                            sbp.c = v_2;
                                            if (habr3())
                                                    return;
                                    } else
                                            I_pV = sbp.c;
                            }
                            sbp.c = v_1;
                            if (sbp.o_g(g_v, 97, 250)) {
                                    v_3 = sbp.c;
                                    if (habr2()) {
                                            sbp.c = v_3;
                                            if (!sbp.i_g(g_v, 97, 250) || sbp.c >= sbp.l)
                                                    return;
                                            sbp.c++;
                                    }
                                    I_pV = sbp.c;
                            }
                    }
                    function habr5() {
                            while (!sbp.i_g(g_v, 97, 250)) {
                                    if (sbp.c >= sbp.l)
                                            return false;
                                    sbp.c++;
                            }
                            while (!sbp.o_g(g_v, 97, 250)) {
                                    if (sbp.c >= sbp.l)
                                            return false;
                                    sbp.c++;
                            }
                            return true;
                    }
                    function r_mark_regions() {
                            var v_1 = sbp.c;
                            I_pV = sbp.l;
                            I_p1 = I_pV;
                            I_p2 = I_pV;
                            habr4();
                            sbp.c = v_1;
                            if (habr5()) {
                                    I_p1 = sbp.c;
                                    if (habr5())
                                            I_p2 = sbp.c;
                            }
                    }
                    function r_postlude() {
                            var a_v;
                            while (true) {
                                    sbp.b = sbp.c;
                                    a_v = sbp.f_a(a_1, 3);
                                    if (a_v) {
                                            sbp.k = sbp.c;
                                            switch (a_v) {
                                                    case 1 :
                                                            sbp.s_f("\u00E3");
                                                            continue;
                                                    case 2 :
                                                            sbp.s_f("\u00F5");
                                                            continue;
                                                    case 3 :
                                                            if (sbp.c >= sbp.l)
                                                                    break;
                                                            sbp.c++;
                                                            continue;
                                            }
                                    }
                                    break;
                            }
                    }
                    function r_RV() {
                            return I_pV <= sbp.c;
                    }
                    function r_R1() {
                            return I_p1 <= sbp.c;
                    }
                    function r_R2() {
                            return I_p2 <= sbp.c;
                    }
                    function r_standard_suffix() {
                            var a_v;
                            sbp.k = sbp.c;
                            a_v = sbp.f_a_b(a_5, 45);
                            if (!a_v)
                                    return false;
                            sbp.b = sbp.c;
                            switch (a_v) {
                                    case 1 :
                                            if (!r_R2())
                                                    return false;
                                            sbp.s_d();
                                            break;
                                    case 2 :
                                            if (!r_R2())
                                                    return false;
                                            sbp.s_f("log");
                                            break;
                                    case 3 :
                                            if (!r_R2())
                                                    return false;
                                            sbp.s_f("u");
                                            break;
                                    case 4 :
                                            if (!r_R2())
                                                    return false;
                                            sbp.s_f("ente");
                                            break;
                                    case 5 :
                                            if (!r_R1())
                                                    return false;
                                            sbp.s_d();
                                            sbp.k = sbp.c;
                                            a_v = sbp.f_a_b(a_2, 4);
                                            if (a_v) {
                                                    sbp.b = sbp.c;
                                                    if (r_R2()) {
                                                            sbp.s_d();
                                                            if (a_v == 1) {
                                                                    sbp.k = sbp.c;
                                                                    if (sbp.e_s_b(2, "at")) {
                                                                            sbp.b = sbp.c;
                                                                            if (r_R2())
                                                                                    sbp.s_d();
                                                                    }
                                                            }
                                                    }
                                            }
                                            break;
                                    case 6 :
                                            if (!r_R2())
                                                    return false;
                                            sbp.s_d();
                                            sbp.k = sbp.c;
                                            a_v = sbp.f_a_b(a_3, 3);
                                            if (a_v) {
                                                    sbp.b = sbp.c;
                                                    if (a_v == 1)
                                                            if (r_R2())
                                                                    sbp.s_d();
                                            }
                                            break;
                                    case 7 :
                                            if (!r_R2())
                                                    return false;
                                            sbp.s_d();
                                            sbp.k = sbp.c;
                                            a_v = sbp.f_a_b(a_4, 3);
                                            if (a_v) {
                                                    sbp.b = sbp.c;
                                                    if (a_v == 1)
                                                            if (r_R2())
                                                                    sbp.s_d();
                                            }
                                            break;
                                    case 8 :
                                            if (!r_R2())
                                                    return false;
                                            sbp.s_d();
                                            sbp.k = sbp.c;
                                            if (sbp.e_s_b(2, "at")) {
                                                    sbp.b = sbp.c;
                                                    if (r_R2())
                                                            sbp.s_d();
                                            }
                                            break;
                                    case 9 :
                                            if (!r_RV() || !sbp.e_s_b(1, "e"))
                                                    return false;
                                            sbp.s_f("ir");
                                            break;
                            }
                            return true;
                    }
                    function r_verb_suffix() {
                            var a_v, v_1;
                            if (sbp.c >= I_pV) {
                                    v_1 = sbp.lb;
                                    sbp.lb = I_pV;
                                    sbp.k = sbp.c;
                                    a_v = sbp.f_a_b(a_6, 120);
                                    if (a_v) {
                                            sbp.b = sbp.c;
                                            if (a_v == 1)
                                                    sbp.s_d();
                                            sbp.lb = v_1;
                                            return true;
                                    }
                                    sbp.lb = v_1;
                            }
                            return false;
                    }
                    function r_residual_suffix() {
                            var a_v;
                            sbp.k = sbp.c;
                            a_v = sbp.f_a_b(a_7, 7);
                            if (a_v) {
                                    sbp.b = sbp.c;
                                    if (a_v == 1)
                                            if (r_RV())
                                                    sbp.s_d();
                            }
                    }
                    function habr6(c1, c2) {
                            if (sbp.e_s_b(1, c1)) {
                                    sbp.b = sbp.c;
                                    var v_1 = sbp.l - sbp.c;
                                    if (sbp.e_s_b(1, c2)) {
                                            sbp.c = sbp.l - v_1;
                                            if (r_RV())
                                                    sbp.s_d();
                                            return false;
                                    }
                            }
                            return true;
                    }
                    function r_residual_form() {
                            var a_v, v_1, v_2, v_3;
                            sbp.k = sbp.c;
                            a_v = sbp.f_a_b(a_8, 4);
                            if (a_v) {
                                    sbp.b = sbp.c;
                                    switch (a_v) {
                                            case 1 :
                                                    if (r_RV()) {
                                                            sbp.s_d();
                                                            sbp.k = sbp.c;
                                                            v_1 = sbp.l - sbp.c;
                                                            if (habr6("u", "g"))
                                                                    habr6("i", "c")
                                                    }
                                                    break;
                                            case 2 :
                                                    sbp.s_f("c");
                                                    break;
                                    }
                            }
                    }
                    function habr1() {
                            if (!r_standard_suffix()) {
                                    sbp.c = sbp.l;
                                    if (!r_verb_suffix()) {
                                            sbp.c = sbp.l;
                                            r_residual_suffix();
                                            return;
                                    }
                            }
                            sbp.c = sbp.l;
                            sbp.k = sbp.c;
                            if (sbp.e_s_b(1, "i")) {
                                    sbp.b = sbp.c;
                                    if (sbp.e_s_b(1, "c")) {
                                            sbp.c = sbp.l;
                                            if (r_RV())
                                                    sbp.s_d();
                                    }
                            }
                    }
                    this.stem = function() {
                            var v_1 = sbp.c;
                            r_prelude();
                            sbp.c = v_1;
                            r_mark_regions();
                            sbp.lb = v_1;
                            sbp.c = sbp.l;
                            habr1();
                            sbp.c = sbp.l;
                            r_residual_form();
                            sbp.c = sbp.lb;
                            r_postlude();
                            return true;
                    }
            }
    }
    var stemName = lng.substring(0, 1).toUpperCase()
            + lng.substring(1).toLowerCase() + "Stemmer";
    return new stemFactory[stemName]();
}
