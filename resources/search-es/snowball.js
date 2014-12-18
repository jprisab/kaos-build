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
        SpanishStemmer : function() {
            var a_0 = [new Among("", -1, 6), new Among("\u00E1", 0, 1),
                    new Among("\u00E9", 0, 2), new Among("\u00ED", 0, 3),
                    new Among("\u00F3", 0, 4), new Among("\u00FA", 0, 5)], a_1 = [
                    new Among("la", -1, -1), new Among("sela", 0, -1),
                    new Among("le", -1, -1), new Among("me", -1, -1),
                    new Among("se", -1, -1), new Among("lo", -1, -1),
                    new Among("selo", 5, -1), new Among("las", -1, -1),
                    new Among("selas", 7, -1), new Among("les", -1, -1),
                    new Among("los", -1, -1), new Among("selos", 10, -1),
                    new Among("nos", -1, -1)], a_2 = [new Among("ando", -1, 6),
                    new Among("iendo", -1, 6), new Among("yendo", -1, 7),
                    new Among("\u00E1ndo", -1, 2),
                    new Among("i\u00E9ndo", -1, 1), new Among("ar", -1, 6),
                    new Among("er", -1, 6), new Among("ir", -1, 6),
                    new Among("\u00E1r", -1, 3), new Among("\u00E9r", -1, 4),
                    new Among("\u00EDr", -1, 5)], a_3 = [
                    new Among("ic", -1, -1), new Among("ad", -1, -1),
                    new Among("os", -1, -1), new Among("iv", -1, 1)], a_4 = [
                    new Among("able", -1, 1), new Among("ible", -1, 1),
                    new Among("ante", -1, 1)], a_5 = [new Among("ic", -1, 1),
                    new Among("abil", -1, 1), new Among("iv", -1, 1)], a_6 = [
                    new Among("ica", -1, 1), new Among("ancia", -1, 2),
                    new Among("encia", -1, 5), new Among("adora", -1, 2),
                    new Among("osa", -1, 1), new Among("ista", -1, 1),
                    new Among("iva", -1, 9), new Among("anza", -1, 1),
                    new Among("log\u00EDa", -1, 3), new Among("idad", -1, 8),
                    new Among("able", -1, 1), new Among("ible", -1, 1),
                    new Among("ante", -1, 2), new Among("mente", -1, 7),
                    new Among("amente", 13, 6), new Among("aci\u00F3n", -1, 2),
                    new Among("uci\u00F3n", -1, 4), new Among("ico", -1, 1),
                    new Among("ismo", -1, 1), new Among("oso", -1, 1),
                    new Among("amiento", -1, 1), new Among("imiento", -1, 1),
                    new Among("ivo", -1, 9), new Among("ador", -1, 2),
                    new Among("icas", -1, 1), new Among("ancias", -1, 2),
                    new Among("encias", -1, 5), new Among("adoras", -1, 2),
                    new Among("osas", -1, 1), new Among("istas", -1, 1),
                    new Among("ivas", -1, 9), new Among("anzas", -1, 1),
                    new Among("log\u00EDas", -1, 3),
                    new Among("idades", -1, 8), new Among("ables", -1, 1),
                    new Among("ibles", -1, 1), new Among("aciones", -1, 2),
                    new Among("uciones", -1, 4), new Among("adores", -1, 2),
                    new Among("antes", -1, 2), new Among("icos", -1, 1),
                    new Among("ismos", -1, 1), new Among("osos", -1, 1),
                    new Among("amientos", -1, 1), new Among("imientos", -1, 1),
                    new Among("ivos", -1, 9)], a_7 = [new Among("ya", -1, 1),
                    new Among("ye", -1, 1), new Among("yan", -1, 1),
                    new Among("yen", -1, 1), new Among("yeron", -1, 1),
                    new Among("yendo", -1, 1), new Among("yo", -1, 1),
                    new Among("yas", -1, 1), new Among("yes", -1, 1),
                    new Among("yais", -1, 1), new Among("yamos", -1, 1),
                    new Among("y\u00F3", -1, 1)], a_8 = [
                    new Among("aba", -1, 2), new Among("ada", -1, 2),
                    new Among("ida", -1, 2), new Among("ara", -1, 2),
                    new Among("iera", -1, 2), new Among("\u00EDa", -1, 2),
                    new Among("ar\u00EDa", 5, 2), new Among("er\u00EDa", 5, 2),
                    new Among("ir\u00EDa", 5, 2), new Among("ad", -1, 2),
                    new Among("ed", -1, 2), new Among("id", -1, 2),
                    new Among("ase", -1, 2), new Among("iese", -1, 2),
                    new Among("aste", -1, 2), new Among("iste", -1, 2),
                    new Among("an", -1, 2), new Among("aban", 16, 2),
                    new Among("aran", 16, 2), new Among("ieran", 16, 2),
                    new Among("\u00EDan", 16, 2),
                    new Among("ar\u00EDan", 20, 2),
                    new Among("er\u00EDan", 20, 2),
                    new Among("ir\u00EDan", 20, 2), new Among("en", -1, 1),
                    new Among("asen", 24, 2), new Among("iesen", 24, 2),
                    new Among("aron", -1, 2), new Among("ieron", -1, 2),
                    new Among("ar\u00E1n", -1, 2),
                    new Among("er\u00E1n", -1, 2),
                    new Among("ir\u00E1n", -1, 2), new Among("ado", -1, 2),
                    new Among("ido", -1, 2), new Among("ando", -1, 2),
                    new Among("iendo", -1, 2), new Among("ar", -1, 2),
                    new Among("er", -1, 2), new Among("ir", -1, 2),
                    new Among("as", -1, 2), new Among("abas", 39, 2),
                    new Among("adas", 39, 2), new Among("idas", 39, 2),
                    new Among("aras", 39, 2), new Among("ieras", 39, 2),
                    new Among("\u00EDas", 39, 2),
                    new Among("ar\u00EDas", 45, 2),
                    new Among("er\u00EDas", 45, 2),
                    new Among("ir\u00EDas", 45, 2), new Among("es", -1, 1),
                    new Among("ases", 49, 2), new Among("ieses", 49, 2),
                    new Among("abais", -1, 2), new Among("arais", -1, 2),
                    new Among("ierais", -1, 2), new Among("\u00EDais", -1, 2),
                    new Among("ar\u00EDais", 55, 2),
                    new Among("er\u00EDais", 55, 2),
                    new Among("ir\u00EDais", 55, 2), new Among("aseis", -1, 2),
                    new Among("ieseis", -1, 2), new Among("asteis", -1, 2),
                    new Among("isteis", -1, 2), new Among("\u00E1is", -1, 2),
                    new Among("\u00E9is", -1, 1),
                    new Among("ar\u00E9is", 64, 2),
                    new Among("er\u00E9is", 64, 2),
                    new Among("ir\u00E9is", 64, 2), new Among("ados", -1, 2),
                    new Among("idos", -1, 2), new Among("amos", -1, 2),
                    new Among("\u00E1bamos", 70, 2),
                    new Among("\u00E1ramos", 70, 2),
                    new Among("i\u00E9ramos", 70, 2),
                    new Among("\u00EDamos", 70, 2),
                    new Among("ar\u00EDamos", 74, 2),
                    new Among("er\u00EDamos", 74, 2),
                    new Among("ir\u00EDamos", 74, 2), new Among("emos", -1, 1),
                    new Among("aremos", 78, 2), new Among("eremos", 78, 2),
                    new Among("iremos", 78, 2),
                    new Among("\u00E1semos", 78, 2),
                    new Among("i\u00E9semos", 78, 2), new Among("imos", -1, 2),
                    new Among("ar\u00E1s", -1, 2),
                    new Among("er\u00E1s", -1, 2),
                    new Among("ir\u00E1s", -1, 2), new Among("\u00EDs", -1, 2),
                    new Among("ar\u00E1", -1, 2), new Among("er\u00E1", -1, 2),
                    new Among("ir\u00E1", -1, 2), new Among("ar\u00E9", -1, 2),
                    new Among("er\u00E9", -1, 2), new Among("ir\u00E9", -1, 2),
                    new Among("i\u00F3", -1, 2)], a_9 = [new Among("a", -1, 1),
                    new Among("e", -1, 2), new Among("o", -1, 1),
                    new Among("os", -1, 1), new Among("\u00E1", -1, 1),
                    new Among("\u00E9", -1, 2), new Among("\u00ED", -1, 1),
                    new Among("\u00F3", -1, 1)], g_v = [17, 65, 16, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 17, 4, 10], I_p2, I_p1, I_pV, sbp = new SnowballProgram();
            this.setCurrent = function(word) {
                sbp.s_c(word);
            };
            this.getCurrent = function() {
                return sbp.g_c();
            };
            function habr1() {
                if (sbp.o_g(g_v, 97, 252)) {
                    while (!sbp.i_g(g_v, 97, 252)) {
                        if (sbp.c >= sbp.l)
                            return true;
                        sbp.c++;
                    }
                    return false;
                }
                return true;
            }
            function habr2() {
                if (sbp.i_g(g_v, 97, 252)) {
                    var v_1 = sbp.c;
                    if (habr1()) {
                        sbp.c = v_1;
                        if (!sbp.i_g(g_v, 97, 252))
                            return true;
                        while (!sbp.o_g(g_v, 97, 252)) {
                            if (sbp.c >= sbp.l)
                                return true;
                            sbp.c++;
                        }
                    }
                    return false;
                }
                return true;
            }
            function habr3() {
                var v_1 = sbp.c, v_2;
                if (habr2()) {
                    sbp.c = v_1;
                    if (!sbp.o_g(g_v, 97, 252))
                        return;
                    v_2 = sbp.c;
                    if (habr1()) {
                        sbp.c = v_2;
                        if (!sbp.i_g(g_v, 97, 252) || sbp.c >= sbp.l)
                            return;
                        sbp.c++;
                    }
                }
                I_pV = sbp.c;
            }
            function habr4() {
                while (!sbp.i_g(g_v, 97, 252)) {
                    if (sbp.c >= sbp.l)
                        return false;
                    sbp.c++;
                }
                while (!sbp.o_g(g_v, 97, 252)) {
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
                habr3();
                sbp.c = v_1;
                if (habr4()) {
                    I_p1 = sbp.c;
                    if (habr4())
                        I_p2 = sbp.c;
                }
            }
            function r_postlude() {
                var a_v;
                while (true) {
                    sbp.b = sbp.c;
                    a_v = sbp.f_a(a_0, 6);
                    if (a_v) {
                        sbp.k = sbp.c;
                        switch (a_v) {
                            case 1 :
                                sbp.s_f("a");
                                continue;
                            case 2 :
                                sbp.s_f("e");
                                continue;
                            case 3 :
                                sbp.s_f("i");
                                continue;
                            case 4 :
                                sbp.s_f("o");
                                continue;
                            case 5 :
                                sbp.s_f("u");
                                continue;
                            case 6 :
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
            function r_attached_pronoun() {
                var a_v;
                sbp.k = sbp.c;
                if (sbp.f_a_b(a_1, 13)) {
                    sbp.b = sbp.c;
                    a_v = sbp.f_a_b(a_2, 11);
                    if (a_v && r_RV())
                        switch (a_v) {
                            case 1 :
                                sbp.b = sbp.c;
                                sbp.s_f("iendo");
                                break;
                            case 2 :
                                sbp.b = sbp.c;
                                sbp.s_f("ando");
                                break;
                            case 3 :
                                sbp.b = sbp.c;
                                sbp.s_f("ar");
                                break;
                            case 4 :
                                sbp.b = sbp.c;
                                sbp.s_f("er");
                                break;
                            case 5 :
                                sbp.b = sbp.c;
                                sbp.s_f("ir");
                                break;
                            case 6 :
                                sbp.s_d();
                                break;
                            case 7 :
                                if (sbp.e_s_b(1, "u"))
                                    sbp.s_d();
                                break;
                        }
                }
            }
            function habr5(a, n) {
                if (!r_R2())
                    return true;
                sbp.s_d();
                sbp.k = sbp.c;
                var a_v = sbp.f_a_b(a, n);
                if (a_v) {
                    sbp.b = sbp.c;
                    if (a_v == 1 && r_R2())
                        sbp.s_d();
                }
                return false;
            }
            function habr6(c1) {
                if (!r_R2())
                    return true;
                sbp.s_d();
                sbp.k = sbp.c;
                if (sbp.e_s_b(2, c1)) {
                    sbp.b = sbp.c;
                    if (r_R2())
                        sbp.s_d();
                }
                return false;
            }
            function r_standard_suffix() {
                var a_v;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_6, 46);
                if (a_v) {
                    sbp.b = sbp.c;
                    switch (a_v) {
                        case 1 :
                            if (!r_R2())
                                return false;
                            sbp.s_d();
                            break;
                        case 2 :
                            if (habr6("ic"))
                                return false;
                            break;
                        case 3 :
                            if (!r_R2())
                                return false;
                            sbp.s_f("log");
                            break;
                        case 4 :
                            if (!r_R2())
                                return false;
                            sbp.s_f("u");
                            break;
                        case 5 :
                            if (!r_R2())
                                return false;
                            sbp.s_f("ente");
                            break;
                        case 6 :
                            if (!r_R1())
                                return false;
                            sbp.s_d();
                            sbp.k = sbp.c;
                            a_v = sbp.f_a_b(a_3, 4);
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
                        case 7 :
                            if (habr5(a_4, 3))
                                return false;
                            break;
                        case 8 :
                            if (habr5(a_5, 3))
                                return false;
                            break;
                        case 9 :
                            if (habr6("at"))
                                return false;
                            break;
                    }
                    return true;
                }
                return false;
            }
            function r_y_verb_suffix() {
                var a_v, v_1;
                if (sbp.c >= I_pV) {
                    v_1 = sbp.lb;
                    sbp.lb = I_pV;
                    sbp.k = sbp.c;
                    a_v = sbp.f_a_b(a_7, 12);
                    sbp.lb = v_1;
                    if (a_v) {
                        sbp.b = sbp.c;
                        if (a_v == 1) {
                            if (!sbp.e_s_b(1, "u"))
                                return false;
                            sbp.s_d();
                        }
                        return true;
                    }
                }
                return false;
            }
            function r_verb_suffix() {
                var a_v, v_1, v_2, v_3;
                if (sbp.c >= I_pV) {
                    v_1 = sbp.lb;
                    sbp.lb = I_pV;
                    sbp.k = sbp.c;
                    a_v = sbp.f_a_b(a_8, 96);
                    sbp.lb = v_1;
                    if (a_v) {
                        sbp.b = sbp.c;
                        switch (a_v) {
                            case 1 :
                                v_2 = sbp.l - sbp.c;
                                if (sbp.e_s_b(1, "u")) {
                                    v_3 = sbp.l - sbp.c;
                                    if (sbp.e_s_b(1, "g"))
                                        sbp.c = sbp.l - v_3;
                                    else
                                        sbp.c = sbp.l - v_2;
                                } else
                                    sbp.c = sbp.l - v_2;
                                sbp.b = sbp.c;
                            case 2 :
                                sbp.s_d();
                                break;
                        }
                    }
                }
            }
            function r_residual_suffix() {
                var a_v, v_1;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_9, 8);
                if (a_v) {
                    sbp.b = sbp.c;
                    switch (a_v) {
                        case 1 :
                            if (r_RV())
                                sbp.s_d();
                            break;
                        case 2 :
                            if (r_RV()) {
                                sbp.s_d();
                                sbp.k = sbp.c;
                                if (sbp.e_s_b(1, "u")) {
                                    sbp.b = sbp.c;
                                    v_1 = sbp.l - sbp.c;
                                    if (sbp.e_s_b(1, "g")) {
                                        sbp.c = sbp.l - v_1;
                                        if (r_RV())
                                            sbp.s_d();
                                    }
                                }
                            }
                            break;
                    }
                }
            }
            this.stem = function() {
                var v_1 = sbp.c;
                r_mark_regions();
                sbp.lb = v_1;
                sbp.c = sbp.l;
                r_attached_pronoun();
                sbp.c = sbp.l;
                if (!r_standard_suffix()) {
                    sbp.c = sbp.l;
                    if (!r_y_verb_suffix()) {
                        sbp.c = sbp.l;
                        r_verb_suffix();
                    }
                }
                sbp.c = sbp.l;
                r_residual_suffix();
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
