/*!
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

module.exports = Snowball;
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
        FrenchStemmer : function() {
            var a_0 = [new Among("col", -1, -1), new Among("par", -1, -1),
                    new Among("tap", -1, -1)], a_1 = [new Among("", -1, 4),
                    new Among("I", 0, 1), new Among("U", 0, 2),
                    new Among("Y", 0, 3)], a_2 = [new Among("iqU", -1, 3),
                    new Among("abl", -1, 3), new Among("I\u00E8r", -1, 4),
                    new Among("i\u00E8r", -1, 4), new Among("eus", -1, 2),
                    new Among("iv", -1, 1)], a_3 = [new Among("ic", -1, 2),
                    new Among("abil", -1, 1), new Among("iv", -1, 3)], a_4 = [
                    new Among("iqUe", -1, 1), new Among("atrice", -1, 2),
                    new Among("ance", -1, 1), new Among("ence", -1, 5),
                    new Among("logie", -1, 3), new Among("able", -1, 1),
                    new Among("isme", -1, 1), new Among("euse", -1, 11),
                    new Among("iste", -1, 1), new Among("ive", -1, 8),
                    new Among("if", -1, 8), new Among("usion", -1, 4),
                    new Among("ation", -1, 2), new Among("ution", -1, 4),
                    new Among("ateur", -1, 2), new Among("iqUes", -1, 1),
                    new Among("atrices", -1, 2), new Among("ances", -1, 1),
                    new Among("ences", -1, 5), new Among("logies", -1, 3),
                    new Among("ables", -1, 1), new Among("ismes", -1, 1),
                    new Among("euses", -1, 11), new Among("istes", -1, 1),
                    new Among("ives", -1, 8), new Among("ifs", -1, 8),
                    new Among("usions", -1, 4), new Among("ations", -1, 2),
                    new Among("utions", -1, 4), new Among("ateurs", -1, 2),
                    new Among("ments", -1, 15), new Among("ements", 30, 6),
                    new Among("issements", 31, 12),
                    new Among("it\u00E9s", -1, 7), new Among("ment", -1, 15),
                    new Among("ement", 34, 6), new Among("issement", 35, 12),
                    new Among("amment", 34, 13), new Among("emment", 34, 14),
                    new Among("aux", -1, 10), new Among("eaux", 39, 9),
                    new Among("eux", -1, 1), new Among("it\u00E9", -1, 7)], a_5 = [
                    new Among("ira", -1, 1), new Among("ie", -1, 1),
                    new Among("isse", -1, 1), new Among("issante", -1, 1),
                    new Among("i", -1, 1), new Among("irai", 4, 1),
                    new Among("ir", -1, 1), new Among("iras", -1, 1),
                    new Among("ies", -1, 1), new Among("\u00EEmes", -1, 1),
                    new Among("isses", -1, 1), new Among("issantes", -1, 1),
                    new Among("\u00EEtes", -1, 1), new Among("is", -1, 1),
                    new Among("irais", 13, 1), new Among("issais", 13, 1),
                    new Among("irions", -1, 1), new Among("issions", -1, 1),
                    new Among("irons", -1, 1), new Among("issons", -1, 1),
                    new Among("issants", -1, 1), new Among("it", -1, 1),
                    new Among("irait", 21, 1), new Among("issait", 21, 1),
                    new Among("issant", -1, 1), new Among("iraIent", -1, 1),
                    new Among("issaIent", -1, 1), new Among("irent", -1, 1),
                    new Among("issent", -1, 1), new Among("iront", -1, 1),
                    new Among("\u00EEt", -1, 1), new Among("iriez", -1, 1),
                    new Among("issiez", -1, 1), new Among("irez", -1, 1),
                    new Among("issez", -1, 1)], a_6 = [new Among("a", -1, 3),
                    new Among("era", 0, 2), new Among("asse", -1, 3),
                    new Among("ante", -1, 3), new Among("\u00E9e", -1, 2),
                    new Among("ai", -1, 3), new Among("erai", 5, 2),
                    new Among("er", -1, 2), new Among("as", -1, 3),
                    new Among("eras", 8, 2), new Among("\u00E2mes", -1, 3),
                    new Among("asses", -1, 3), new Among("antes", -1, 3),
                    new Among("\u00E2tes", -1, 3),
                    new Among("\u00E9es", -1, 2), new Among("ais", -1, 3),
                    new Among("erais", 15, 2), new Among("ions", -1, 1),
                    new Among("erions", 17, 2), new Among("assions", 17, 3),
                    new Among("erons", -1, 2), new Among("ants", -1, 3),
                    new Among("\u00E9s", -1, 2), new Among("ait", -1, 3),
                    new Among("erait", 23, 2), new Among("ant", -1, 3),
                    new Among("aIent", -1, 3), new Among("eraIent", 26, 2),
                    new Among("\u00E8rent", -1, 2), new Among("assent", -1, 3),
                    new Among("eront", -1, 2), new Among("\u00E2t", -1, 3),
                    new Among("ez", -1, 2), new Among("iez", 32, 2),
                    new Among("eriez", 33, 2), new Among("assiez", 33, 3),
                    new Among("erez", 32, 2), new Among("\u00E9", -1, 2)], a_7 = [
                    new Among("e", -1, 3), new Among("I\u00E8re", 0, 2),
                    new Among("i\u00E8re", 0, 2), new Among("ion", -1, 1),
                    new Among("Ier", -1, 2), new Among("ier", -1, 2),
                    new Among("\u00EB", -1, 4)], a_8 = [
                    new Among("ell", -1, -1), new Among("eill", -1, -1),
                    new Among("enn", -1, -1), new Among("onn", -1, -1),
                    new Among("ett", -1, -1)], g_v = [17, 65, 16, 1, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 128, 130, 103, 8, 5], g_keep_with_s = [
                    1, 65, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128], I_p2, I_p1, I_pV, sbp = new SnowballProgram();
            this.setCurrent = function(word) {
                sbp.s_c(word);
            };
            this.getCurrent = function() {
                return sbp.g_c();
            };
            function habr1(c1, c2, v_1) {
                if (sbp.e_s(1, c1)) {
                    sbp.k = sbp.c;
                    if (sbp.i_g(g_v, 97, 251)) {
                        sbp.s_f(c2);
                        sbp.c = v_1;
                        return true;
                    }
                }
                return false;
            }
            function habr2(c1, c2, v_1) {
                if (sbp.e_s(1, c1)) {
                    sbp.k = sbp.c;
                    sbp.s_f(c2);
                    sbp.c = v_1;
                    return true;
                }
                return false;
            }
            function r_prelude() {
                var v_1, v_2;
                while (true) {
                    v_1 = sbp.c;
                    if (sbp.i_g(g_v, 97, 251)) {
                        sbp.b = sbp.c;
                        v_2 = sbp.c;
                        if (habr1("u", "U", v_1))
                            continue;
                        sbp.c = v_2;
                        if (habr1("i", "I", v_1))
                            continue;
                        sbp.c = v_2;
                        if (habr2("y", "Y", v_1))
                            continue;
                    }
                    sbp.c = v_1;
                    sbp.b = v_1;
                    if (!habr1("y", "Y", v_1)) {
                        sbp.c = v_1;
                        if (sbp.e_s(1, "q")) {
                            sbp.b = sbp.c;
                            if (habr2("u", "U", v_1))
                                continue;
                        }
                        sbp.c = v_1;
                        if (v_1 >= sbp.l)
                            return;
                        sbp.c++;
                    }
                }
            }
            function habr3() {
                while (!sbp.i_g(g_v, 97, 251)) {
                    if (sbp.c >= sbp.l)
                        return true;
                    sbp.c++;
                }
                while (!sbp.o_g(g_v, 97, 251)) {
                    if (sbp.c >= sbp.l)
                        return true;
                    sbp.c++;
                }
                return false;
            }
            function r_mark_regions() {
                var v_1 = sbp.c;
                I_pV = sbp.l;
                I_p1 = I_pV;
                I_p2 = I_pV;
                if (sbp.i_g(g_v, 97, 251)
                        && sbp.i_g(g_v, 97, 251) && sbp.c < sbp.l)
                    sbp.c++;
                else {
                    sbp.c = v_1;
                    if (!sbp.f_a(a_0, 3)) {
                        sbp.c = v_1;
                        do {
                            if (sbp.c >= sbp.l) {
                                sbp.c = I_pV;
                                break;
                            }
                            sbp.c++;
                        } while (!sbp.i_g(g_v, 97, 251));
                    }
                }
                I_pV = sbp.c;
                sbp.c = v_1;
                if (!habr3()) {
                    I_p1 = sbp.c;
                    if (!habr3())
                        I_p2 = sbp.c;
                }
            }
            function r_postlude() {
                var a_v, v_1;
                while (true) {
                    v_1 = sbp.c;
                    sbp.b = v_1;
                    a_v = sbp.f_a(a_1, 4);
                    if (!a_v)
                        break;
                    sbp.k = sbp.c;
                    switch (a_v) {
                        case 1 :
                            sbp.s_f("i");
                            break;
                        case 2 :
                            sbp.s_f("u");
                            break;
                        case 3 :
                            sbp.s_f("y");
                            break;
                        case 4 :
                            if (sbp.c >= sbp.l)
                                return;
                            sbp.c++;
                            break;
                    }
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
                var a_v, v_1;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_4, 43);
                if (a_v) {
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
                            sbp.s_d();
                            sbp.k = sbp.c;
                            if (sbp.e_s_b(2, "ic")) {
                                sbp.b = sbp.c;
                                if (!r_R2())
                                    sbp.s_f("iqU");
                                else
                                    sbp.s_d();
                            }
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
                            sbp.s_f("ent");
                            break;
                        case 6 :
                            if (!r_RV())
                                return false;
                            sbp.s_d();
                            sbp.k = sbp.c;
                            a_v = sbp.f_a_b(a_2, 6);
                            if (a_v) {
                                sbp.b = sbp.c;
                                switch (a_v) {
                                    case 1 :
                                        if (r_R2()) {
                                            sbp.s_d();
                                            sbp.k = sbp.c;
                                            if (sbp.e_s_b(2, "at")) {
                                                sbp.b = sbp.c;
                                                if (r_R2())
                                                    sbp.s_d();
                                            }
                                        }
                                        break;
                                    case 2 :
                                        if (r_R2())
                                            sbp.s_d();
                                        else if (r_R1())
                                            sbp.s_f("eux");
                                        break;
                                    case 3 :
                                        if (r_R2())
                                            sbp.s_d();
                                        break;
                                    case 4 :
                                        if (r_RV())
                                            sbp.s_f("i");
                                        break;
                                }
                            }
                            break;
                        case 7 :
                            if (!r_R2())
                                return false;
                            sbp.s_d();
                            sbp.k = sbp.c;
                            a_v = sbp.f_a_b(a_3, 3);
                            if (a_v) {
                                sbp.b = sbp.c;
                                switch (a_v) {
                                    case 1 :
                                        if (r_R2())
                                            sbp.s_d();
                                        else
                                            sbp.s_f("abl");
                                        break;
                                    case 2 :
                                        if (r_R2())
                                            sbp.s_d();
                                        else
                                            sbp.s_f("iqU");
                                        break;
                                    case 3 :
                                        if (r_R2())
                                            sbp.s_d();
                                        break;
                                }
                            }
                            break;
                        case 8 :
                            if (!r_R2())
                                return false;
                            sbp.s_d();
                            sbp.k = sbp.c;
                            if (sbp.e_s_b(2, "at")) {
                                sbp.b = sbp.c;
                                if (r_R2()) {
                                    sbp.s_d();
                                    sbp.k = sbp.c;
                                    if (sbp.e_s_b(2, "ic")) {
                                        sbp.b = sbp.c;
                                        if (r_R2())
                                            sbp.s_d();
                                        else
                                            sbp.s_f("iqU");
                                        break;
                                    }
                                }
                            }
                            break;
                        case 9 :
                            sbp.s_f("eau");
                            break;
                        case 10 :
                            if (!r_R1())
                                return false;
                            sbp.s_f("al");
                            break;
                        case 11 :
                            if (r_R2())
                                sbp.s_d();
                            else if (!r_R1())
                                return false;
                            else
                                sbp.s_f("eux");
                            break;
                        case 12 :
                            if (!r_R1() || !sbp.o_g_b(g_v, 97, 251))
                                return false;
                            sbp.s_d();
                            break;
                        case 13 :
                            if (r_RV())
                                sbp.s_f("ant");
                            return false;
                        case 14 :
                            if (r_RV())
                                sbp.s_f("ent");
                            return false;
                        case 15 :
                            v_1 = sbp.l - sbp.c;
                            if (sbp.i_g_b(g_v, 97, 251) && r_RV()) {
                                sbp.c = sbp.l - v_1;
                                sbp.s_d();
                            }
                            return false;
                    }
                    return true;
                }
                return false;
            }
            function r_i_verb_suffix() {
                var a_v, v_1;
                if (sbp.c < I_pV)
                    return false;
                v_1 = sbp.lb;
                sbp.lb = I_pV;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_5, 35);
                if (!a_v) {
                    sbp.lb = v_1;
                    return false;
                }
                sbp.b = sbp.c;
                if (a_v == 1) {
                    if (!sbp.o_g_b(g_v, 97, 251)) {
                        sbp.lb = v_1;
                        return false;
                    }
                    sbp.s_d();
                }
                sbp.lb = v_1;
                return true;
            }
            function r_verb_suffix() {
                var a_v, v_2, v_3;
                if (sbp.c < I_pV)
                    return false;
                v_2 = sbp.lb;
                sbp.lb = I_pV;
                sbp.k = sbp.c;
                a_v = sbp.f_a_b(a_6, 38);
                if (!a_v) {
                    sbp.lb = v_2;
                    return false;
                }
                sbp.b = sbp.c;
                switch (a_v) {
                    case 1 :
                        if (!r_R2()) {
                            sbp.lb = v_2;
                            return false;
                        }
                        sbp.s_d();
                        break;
                    case 2 :
                        sbp.s_d();
                        break;
                    case 3 :
                        sbp.s_d();
                        v_3 = sbp.l - sbp.c;
                        sbp.k = sbp.c;
                        if (sbp.e_s_b(1, "e")) {
                            sbp.b = sbp.c;
                            sbp.s_d();
                        } else
                            sbp.c = sbp.l - v_3;
                        break;
                }
                sbp.lb = v_2;
                return true;
            }
            function r_residual_suffix() {
                var a_v, v_1 = sbp.l - sbp.c, v_2, v_4, v_5;
                sbp.k = sbp.c;
                if (sbp.e_s_b(1, "s")) {
                    sbp.b = sbp.c;
                    v_2 = sbp.l - sbp.c;
                    if (sbp.o_g_b(g_keep_with_s, 97, 232)) {
                        sbp.c = sbp.l - v_2;
                        sbp.s_d();
                    } else
                        sbp.c = sbp.l - v_1;
                } else
                    sbp.c = sbp.l - v_1;
                if (sbp.c >= I_pV) {
                    v_4 = sbp.lb;
                    sbp.lb = I_pV;
                    sbp.k = sbp.c;
                    a_v = sbp.f_a_b(a_7, 7);
                    if (a_v) {
                        sbp.b = sbp.c;
                        switch (a_v) {
                            case 1 :
                                if (r_R2()) {
                                    v_5 = sbp.l - sbp.c;
                                    if (!sbp.e_s_b(1, "s")) {
                                        sbp.c = sbp.l - v_5;
                                        if (!sbp.e_s_b(1, "t"))
                                            break;
                                    }
                                    sbp.s_d();
                                }
                                break;
                            case 2 :
                                sbp.s_f("i");
                                break;
                            case 3 :
                                sbp.s_d();
                                break;
                            case 4 :
                                if (sbp.e_s_b(2, "gu"))
                                    sbp.s_d();
                                break;
                        }
                    }
                    sbp.lb = v_4;
                }
            }
            function r_un_double() {
                var v_1 = sbp.l - sbp.c;
                if (sbp.f_a_b(a_8, 5)) {
                    sbp.c = sbp.l - v_1;
                    sbp.k = sbp.c;
                    if (sbp.c > sbp.lb) {
                        sbp.c--;
                        sbp.b = sbp.c;
                        sbp.s_d();
                    }
                }
            }
            function r_un_accent() {
                var v_1, v_2 = 1;
                while (sbp.o_g_b(g_v, 97, 251))
                    v_2--;
                if (v_2 <= 0) {
                    sbp.k = sbp.c;
                    v_1 = sbp.l - sbp.c;
                    if (!sbp.e_s_b(1, "\u00E9")) {
                        sbp.c = sbp.l - v_1;
                        if (!sbp.e_s_b(1, "\u00E8"))
                            return;
                    }
                    sbp.b = sbp.c;
                    sbp.s_f("e");
                }
            }
            function habr5() {
                if (!r_standard_suffix()) {
                    sbp.c = sbp.l;
                    if (!r_i_verb_suffix()) {
                        sbp.c = sbp.l;
                        if (!r_verb_suffix()) {
                            sbp.c = sbp.l;
                            r_residual_suffix();
                            return;
                        }
                    }
                }
                sbp.c = sbp.l;
                sbp.k = sbp.c;
                if (sbp.e_s_b(1, "Y")) {
                    sbp.b = sbp.c;
                    sbp.s_f("i");
                } else {
                    sbp.c = sbp.l;
                    if (sbp.e_s_b(1, "\u00E7")) {
                        sbp.b = sbp.c;
                        sbp.s_f("c");
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
                habr5();
                sbp.c = sbp.l;
                r_un_double();
                sbp.c = sbp.l;
                r_un_accent();
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
