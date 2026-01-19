--
-- PostgreSQL database dump
--

\restrict VdpPYkgKBVKDf8v1ewGeBsi2LeoB0rxvQnT0EeMaROzBTWKLi3vn7OCpWKdkcNX

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-19 08:23:52

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 287 (class 1255 OID 122887)
-- Name: fn_activate_scheduled_surveys(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_activate_scheduled_surveys() RETURNS integer
    LANGUAGE plpgsql
    AS $$ -- ترجع عدد الاستبيانات التي تم تفعيلها
DECLARE
    v_count INT;
BEGIN
    UPDATE surveys
    SET status_id = 2 -- 2 = ACTIVE
    WHERE status_id = 1 -- 1 = DRAFT
    AND is_periodic = FALSE -- فقط التي لمرة واحدة
    AND start_date IS NOT NULL
    AND start_date <= NOW(); -- التي حان وقتها الآن أو فات

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;


ALTER FUNCTION public.fn_activate_scheduled_surveys() OWNER TO postgres;

--
-- TOC entry 290 (class 1255 OID 65539)
-- Name: fn_add_question(integer, text, integer, boolean, jsonb, integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_add_question(p_survey_id integer, p_text text, p_type_id integer, p_req boolean, p_opts jsonb, p_order integer, p_logic jsonb DEFAULT NULL::jsonb) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_status_id INT;
    v_id INT;
BEGIN
    -- التحقق: هل الاستبيان مسودة (ID=1)؟
    SELECT status_id INTO v_status_id FROM surveys WHERE id = p_survey_id;
    
    IF v_status_id != 1 OR v_status_id IS NULL THEN 
        RAISE EXCEPTION 'لا يمكن التعديل بعد النشر'; 
    END IF;

    -- التحقق: هل نوع السؤال موجود؟
    PERFORM 1 FROM question_types WHERE id = p_type_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'نوع السؤال غير موجود';
    END IF;

    INSERT INTO survey_questions (
        survey_id, question_text, question_type_id, 
        is_required, options_json, order_index, logic_rules
    )
    VALUES (
        p_survey_id, p_text, p_type_id, 
        p_req, p_opts, p_order, p_logic
    ) 
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;


ALTER FUNCTION public.fn_add_question(p_survey_id integer, p_text text, p_type_id integer, p_req boolean, p_opts jsonb, p_order integer, p_logic jsonb) OWNER TO postgres;

--
-- TOC entry 288 (class 1255 OID 122888)
-- Name: fn_close_expired_surveys(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_close_expired_surveys() RETURNS integer
    LANGUAGE plpgsql
    AS $$ -- ترجع عدد الاستبيانات التي تم إغلاقها
DECLARE
    v_count INT;
BEGIN
    UPDATE surveys
    SET status_id = 3 -- 3 = CLOSED
    WHERE status_id = 2 -- 2 = ACTIVE
    AND is_periodic = FALSE
    AND end_date IS NOT NULL
    AND end_date < NOW(); -- التي انتهت مهلتها

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;


ALTER FUNCTION public.fn_close_expired_surveys() OWNER TO postgres;

--
-- TOC entry 268 (class 1255 OID 49477)
-- Name: fn_create_school(character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_create_school(p_name character varying, p_code character varying, p_region character varying, p_directorate_id integer, p_complex_id integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_school_id INT;
BEGIN
    -- التحقق من تفرد الكود (Validation)
    IF EXISTS(SELECT 1 FROM schools WHERE code = p_code) THEN
        RAISE EXCEPTION 'كود المدرسة مستخدم مسبقاً';
    END IF;

    -- التحقق: هل المجمع يتبع للمديرية؟ (Data Integrity)
    -- هذا فحص إضافي لضمان عدم وجود خطأ في البيانات المدخلة
    IF p_complex_id IS NOT NULL THEN
        PERFORM 1 FROM complexes 
        WHERE id = p_complex_id AND directorate_id = p_directorate_id;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'المجمع المختار لا يتبع للمديرية المحددة';
        END IF;
    END IF;

    -- الإدخال
    INSERT INTO schools (name, code, region, directorate_id, complex_id)
    VALUES (p_name, p_code, p_region, p_directorate_id, p_complex_id)
    RETURNING id INTO v_school_id;
    
    RETURN v_school_id;
END;
$$;


ALTER FUNCTION public.fn_create_school(p_name character varying, p_code character varying, p_region character varying, p_directorate_id integer, p_complex_id integer) OWNER TO postgres;

--
-- TOC entry 297 (class 1255 OID 65538)
-- Name: fn_create_survey(character varying, text, boolean, timestamp without time zone, timestamp without time zone, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_create_survey(p_title character varying, p_description text, p_is_periodic boolean, p_start_date timestamp without time zone, p_end_date timestamp without time zone, p_frequency_id integer, p_created_by integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id INT;
BEGIN
    -- الحالة الافتراضية رقم 1 draft
    INSERT INTO surveys (
        title, description, status_id, 
        is_periodic, start_date, end_date, frequency_id, 
        created_by
    ) 
    VALUES (
        p_title, p_description, 1, 
        p_is_periodic, p_start_date, p_end_date, p_frequency_id, 
        p_created_by
    )
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;


ALTER FUNCTION public.fn_create_survey(p_title character varying, p_description text, p_is_periodic boolean, p_start_date timestamp without time zone, p_end_date timestamp without time zone, p_frequency_id integer, p_created_by integer) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 65536)
-- Name: fn_create_user(character varying, character varying, integer, integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_create_user(p_username character varying, p_password character varying, p_role_id integer, p_school_ids integer[] DEFAULT NULL::integer[]) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INT;
    v_role_name VARCHAR;
BEGIN
    -- 1. التحقق من وجود الدور
    SELECT name INTO v_role_name FROM roles WHERE id = p_role_id;
    IF v_role_name IS NULL THEN 
        RAISE EXCEPTION 'الدور المحدد غير موجود'; 
    END IF;

    -- 2. التحقق من شرط المدارس
    IF v_role_name = 'SCHOOL_USER' AND (p_school_ids IS NULL OR array_length(p_school_ids, 1) IS NULL) THEN
        RAISE EXCEPTION 'يجب تحديد مدرسة واحدة على الأقل لمستخدمي المدارس.';
    END IF;

    INSERT INTO users (username, password, role_id)
    VALUES (p_username, p_password, p_role_id)
    RETURNING id INTO v_user_id;

    -- 4. ربط المدارس
    IF v_role_name = 'SCHOOL_USER' AND p_school_ids IS NOT NULL THEN
        INSERT INTO user_schools (user_id, school_id)
        SELECT v_user_id, unnest(p_school_ids);
    END IF;
    
    RETURN v_user_id;
END;
$$;


ALTER FUNCTION public.fn_create_user(p_username character varying, p_password character varying, p_role_id integer, p_school_ids integer[]) OWNER TO postgres;

--
-- TOC entry 289 (class 1255 OID 172032)
-- Name: fn_delete_question(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_delete_question(p_question_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_status_id INT;
BEGIN
    -- 1. جلب حالة الاستبيان المرتبط بهذا السؤال
    SELECT s.status_id INTO v_status_id
    FROM survey_questions q
    JOIN surveys s ON q.survey_id = s.id
    WHERE q.id = p_question_id;

    -- إذا لم يجد السؤال
    IF v_status_id IS NULL THEN
        RAISE EXCEPTION 'السؤال غير موجود';
    END IF;

    -- 2. التحقق من الحالة (1 = DRAFT)
    IF v_status_id != 1 THEN 
        RAISE EXCEPTION 'لا يمكن حذف أسئلة من استبيان تم نشره أو إغلاقه';
    END IF;

    -- 3. الحذف
    DELETE FROM survey_questions WHERE id = p_question_id;
END;
$$;


ALTER FUNCTION public.fn_delete_question(p_question_id integer) OWNER TO postgres;

--
-- TOC entry 271 (class 1255 OID 57345)
-- Name: fn_delete_school(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_delete_school(p_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE  FROM schools WHERE id = p_id ;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'المدرسة غير موجودة';
    END IF;
END;
$$;


ALTER FUNCTION public.fn_delete_school(p_id integer) OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 65543)
-- Name: fn_delete_survey(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_delete_survey(p_survey_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_status_id INT;
BEGIN
    SELECT status_id INTO v_status_id FROM surveys WHERE id = p_survey_id;

    IF v_status_id IS NULL THEN
        RAISE EXCEPTION 'الاستبيان غير موجود';
    END IF;

    IF v_status_id != 1 THEN 
        RAISE EXCEPTION 'لا يمكن حذف استبيان نشط، قم بإغلاقه بدلاً من ذلك';
    END IF;

    DELETE FROM surveys WHERE id = p_survey_id;
END;
$$;


ALTER FUNCTION public.fn_delete_survey(p_survey_id integer) OWNER TO postgres;

--
-- TOC entry 264 (class 1255 OID 49485)
-- Name: fn_delete_user(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_delete_user(p_user_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM users WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'المستخدم غير موجود';
    END IF;
END;
$$;


ALTER FUNCTION public.fn_delete_user(p_user_id integer) OWNER TO postgres;

--
-- TOC entry 296 (class 1255 OID 180224)
-- Name: fn_edit_question(integer, text, integer, boolean, jsonb, integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_edit_question(p_question_id integer, p_text text, p_type_id integer, p_req boolean, p_opts jsonb, p_order integer, p_logic jsonb DEFAULT NULL::jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_status_id INT;
BEGIN
    -- 1. جلب حالة الاستبيان المرتبط بهذا السؤال
    SELECT s.status_id INTO v_status_id
    FROM survey_questions q
    JOIN surveys s ON q.survey_id = s.id
    WHERE q.id = p_question_id;

    -- التحقق من الوجود
    IF v_status_id IS NULL THEN
        RAISE EXCEPTION 'السؤال غير موجود';
    END IF;

    -- 2. التحقق من أن الاستبيان مسودة (1)
    IF v_status_id != 1 THEN 
        RAISE EXCEPTION 'لا يمكن تعديل سؤال في استبيان منشور أو مغلق';
    END IF;

    -- 3. التحقق من نوع السؤال الجديد (اختياري، للسلامة)
    PERFORM 1 FROM question_types WHERE id = p_type_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'نوع السؤال غير صحيح';
    END IF;

    -- 4. التعديل
    UPDATE survey_questions
    SET 
        question_text = p_text,
        question_type_id = p_type_id,
        is_required = p_req,
        options_json = p_opts,
        order_index = p_order,
        logic_rules = p_logic
    WHERE id = p_question_id;
END;
$$;


ALTER FUNCTION public.fn_edit_question(p_question_id integer, p_text text, p_type_id integer, p_req boolean, p_opts jsonb, p_order integer, p_logic jsonb) OWNER TO postgres;

--
-- TOC entry 265 (class 1255 OID 49478)
-- Name: fn_get_all_schools(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_all_schools() RETURNS TABLE(id integer, name character varying, code character varying, region character varying, directorate_name character varying, complex_name character varying, users_count bigint, created_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        s.id, 
        s.name, 
        s.code, 
        s.region,
        d.name AS directorate_name,
        c.name AS complex_name,
        COUNT(us.user_id) AS users_count,
        s.created_at
    FROM schools s
    LEFT JOIN directorates d ON s.directorate_id = d.id
    LEFT JOIN complexes c ON s.complex_id = c.id
    LEFT JOIN user_schools us ON s.id = us.school_id
    GROUP BY s.id, d.name, c.name
    ORDER BY s.id DESC;
END;
$$;


ALTER FUNCTION public.fn_get_all_schools() OWNER TO postgres;

--
-- TOC entry 299 (class 1255 OID 65544)
-- Name: fn_get_all_surveys_admin(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_all_surveys_admin(p_status_id_filter integer DEFAULT NULL::integer) RETURNS TABLE(id integer, title character varying, status_label character varying, is_periodic boolean, frequency_label character varying, created_by_name character varying, created_at timestamp without time zone, target_count bigint, response_count bigint, completion_rate numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        st.label AS status_label,
        s.is_periodic,
        COALESCE(f.name, 'لمرة واحدة') AS frequency_label,
        u.username AS created_by_name,
        s.created_at,
        COUNT(sts.school_id) AS target_count,
        COUNT(sts.school_id) FILTER (WHERE sts.status_id = 2) AS response_count, -- 2 = SUBMITTED
        CASE 
            WHEN COUNT(sts.school_id) > 0 THEN 
              ROUND(
            (COUNT(sts.school_id) FILTER (WHERE sts.status_id = 2)::NUMERIC 
            / COUNT(sts.school_id)::NUMERIC) * 100, 
        2)
            ELSE 0 
        END AS completion_rate
    FROM surveys s
    JOIN survey_statuses st ON s.status_id = st.id
    LEFT JOIN frequencies f ON s.frequency_id = f.id
    LEFT JOIN users u ON s.created_by = u.id
    LEFT JOIN survey_target_schools sts ON s.id = sts.survey_id
    WHERE (p_status_id_filter IS NULL OR s.status_id = p_status_id_filter)
    GROUP BY s.id, st.label, f.name, u.username
    ORDER BY s.created_at DESC;
END;
$$;


ALTER FUNCTION public.fn_get_all_surveys_admin(p_status_id_filter integer) OWNER TO postgres;

--
-- TOC entry 266 (class 1255 OID 49486)
-- Name: fn_get_all_users(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_all_users(p_role_id_filter integer DEFAULT NULL::integer) RETURNS TABLE(id integer, username character varying, role_name character varying, school_names text, created_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, 
        u.username, 
        r.name AS role_name, 
        COALESCE(string_agg(s.name, ', '), 'N/A') AS school_names,
        u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id 
    LEFT JOIN user_schools us ON u.id = us.user_id
    LEFT JOIN schools s ON us.school_id = s.id
    WHERE (p_role_id_filter IS NULL OR u.role_id = p_role_id_filter)
    GROUP BY u.id, u.username, r.name, u.created_at
    ORDER BY u.created_at DESC;
END;
$$;


ALTER FUNCTION public.fn_get_all_users(p_role_id_filter integer) OWNER TO postgres;

--
-- TOC entry 279 (class 1255 OID 65549)
-- Name: fn_get_available_surveys_for_school(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_available_surveys_for_school(p_school_id integer) RETURNS TABLE(survey_id integer, title character varying, created_at timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id, 
        s.title, 
        s.created_at
    FROM surveys s
    JOIN survey_target_schools sts ON s.id = sts.survey_id
    WHERE sts.school_id = p_school_id
    AND s.status_id = 2      -- 2 = ACTIVE (نشط)
    AND sts.status_id = 1    -- 1 = PENDING (لم يجاوب بعد)
    ORDER BY s.created_at DESC;
END;
$$;


ALTER FUNCTION public.fn_get_available_surveys_for_school(p_school_id integer) OWNER TO postgres;

--
-- TOC entry 249 (class 1255 OID 49474)
-- Name: fn_get_complexes(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_complexes(p_dir_id integer) RETURNS TABLE(id integer, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT c.id, c.name FROM complexes c WHERE c.directorate_id = p_dir_id ORDER BY c.id;
END;
$$;


ALTER FUNCTION public.fn_get_complexes(p_dir_id integer) OWNER TO postgres;

--
-- TOC entry 248 (class 1255 OID 49473)
-- Name: fn_get_directorates(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_directorates() RETURNS TABLE(id integer, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT d.id, d.name FROM directorates d ORDER BY d.id;
END;
$$;


ALTER FUNCTION public.fn_get_directorates() OWNER TO postgres;

--
-- TOC entry 262 (class 1255 OID 49476)
-- Name: fn_get_frequencies(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_frequencies() RETURNS TABLE(id integer, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT f.id, f.name FROM frequencies f ORDER BY id;
END;
$$;


ALTER FUNCTION public.fn_get_frequencies() OWNER TO postgres;

--
-- TOC entry 298 (class 1255 OID 122885)
-- Name: fn_get_global_system_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_global_system_stats() RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total_surveys INT;
    v_total_responses BIGINT;
    v_total_schools INT;
    v_total_users INT;
    v_monthly_activity JSON;
    v_surveys_by_type JSON;
    v_recent_activity JSON;
BEGIN
    -- 1. العدادات الرئيسية
    SELECT COUNT(*) INTO v_total_surveys FROM surveys;
    SELECT COUNT(*) INTO v_total_responses FROM survey_responses;
    SELECT COUNT(*) INTO v_total_schools FROM schools;
    SELECT COUNT(*) INTO v_total_users FROM users;

    -- 2. النشاط الشهري (آخر 6 أشهر)
    SELECT json_agg(json_build_object('month', t.mon, 'count', t.cnt))
    INTO v_monthly_activity
    FROM (
        SELECT TO_CHAR(created_at, 'Month') as mon, COUNT(*) as cnt
        FROM surveys
        WHERE created_at > NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR(created_at, 'Month'), EXTRACT(MONTH FROM created_at)
        ORDER BY EXTRACT(MONTH FROM created_at)
    ) t;

    -- 3. توزيع الأنواع
    SELECT json_build_object(
        'periodic', COUNT(*) FILTER (WHERE is_periodic = TRUE),
        'regular', COUNT(*) FILTER (WHERE is_periodic = FALSE)
    ) INTO v_surveys_by_type
    FROM surveys;

    -- 4. النشاط الأخير (تم التصحيح باستخدام Subquery)
    SELECT json_agg(t) INTO v_recent_activity
    FROM (
        SELECT 
            s.title,
            u.username as created_by,
            s.created_at as date,
            st.label as status
        FROM surveys s
        LEFT JOIN users u ON s.created_by = u.id
        LEFT JOIN survey_statuses st ON s.status_id = st.id
        ORDER BY s.created_at DESC
        LIMIT 5
    ) t; -- هذا الجدول المؤقت t يحتوي على أحدث 5، ثم نحوله لـ JSON

    -- 5. التجميع النهائي
    RETURN json_build_object(
        'cards', json_build_object(
            'total_surveys', v_total_surveys,
            'total_responses', v_total_responses,
            'total_schools', v_total_schools,
            'total_users', v_total_users
        ),
        'charts', json_build_object(
            'monthly_activity', COALESCE(v_monthly_activity, '[]'::json),
            'surveys_by_type', v_surveys_by_type
        ),
        'recent_activity', COALESCE(v_recent_activity, '[]'::json)
    );
END;
$$;


ALTER FUNCTION public.fn_get_global_system_stats() OWNER TO postgres;

--
-- TOC entry 263 (class 1255 OID 49475)
-- Name: fn_get_question_types(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_question_types() RETURNS TABLE(id integer, code character varying, label character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT qt.id, qt.code, qt.label FROM question_types  qt ORDER BY id;
END;
$$;


ALTER FUNCTION public.fn_get_question_types() OWNER TO postgres;

--
-- TOC entry 247 (class 1255 OID 49472)
-- Name: fn_get_roles(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_roles() RETURNS TABLE(id integer, name character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT r.id, r.name FROM roles r ORDER BY r.id;
END;
$$;


ALTER FUNCTION public.fn_get_roles() OWNER TO postgres;

--
-- TOC entry 292 (class 1255 OID 163844)
-- Name: fn_get_school_by_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_school_by_id(p_id integer) RETURNS TABLE(id integer, name character varying, code character varying, region character varying, directorate_id integer, complex_id integer, directorate_name character varying, complex_name character varying, created_at timestamp without time zone, linked_users json, users_count bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id, 
        s.name, 
        s.code, 
        s.region, 
        s.directorate_id,
        s.complex_id,
        d.name AS directorate_name,
        c.name AS complex_name,
        s.created_at,

        COALESCE(
            json_agg(
                json_build_object('id', u.id, 'username', u.username)
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'::json
        ) AS linked_users,

        COUNT(DISTINCT u.id) AS users_count

    FROM schools s
    LEFT JOIN directorates d ON s.directorate_id = d.id
    LEFT JOIN complexes c ON s.complex_id = c.id
    LEFT JOIN user_schools us ON s.id = us.school_id
    LEFT JOIN users u ON us.user_id = u.id
    WHERE s.id = p_id
    GROUP BY s.id, d.name, c.name;
END;
$$;


ALTER FUNCTION public.fn_get_school_by_id(p_id integer) OWNER TO postgres;

--
-- TOC entry 294 (class 1255 OID 180238)
-- Name: fn_get_school_response_details(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_school_response_details(p_survey_id integer, p_school_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        -- 1. معلومات الرأس (Header)
        'school_name', s.name,
        'directorate', d.name,
        'submitted_by', u.username,
        'submitted_at', r.submitted_at,
        
        -- 2. قائمة الإجابات (Answers List)
        'answers', COALESCE((
            SELECT json_agg(json_build_object(
                'question_id', q.id,
                'question_text', q.question_text,
                'type', qt.label,
                'answer_value', sa.answer_value -- يرجع القيمة كما هي (رقم، نص، مصفوفة)
            ) ORDER BY q.order_index)
            FROM survey_answers sa
            JOIN survey_questions q ON sa.question_id = q.id
            JOIN question_types qt ON q.question_type_id = qt.id
            WHERE sa.response_id = r.id
        ), '[]'::json)
    ) INTO v_result
    FROM survey_responses r
    JOIN schools s ON r.school_id = s.id
    LEFT JOIN directorates d ON s.directorate_id = d.id
    LEFT JOIN users u ON r.submitted_by = u.id
    WHERE r.survey_id = p_survey_id AND r.school_id = p_school_id;

    RETURN v_result;
END;
$$;


ALTER FUNCTION public.fn_get_school_response_details(p_survey_id integer, p_school_id integer) OWNER TO postgres;

--
-- TOC entry 291 (class 1255 OID 163840)
-- Name: fn_get_school_statistics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_school_statistics() RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total_schools INT;
    v_total_directorates INT;
    v_total_complexes INT;
    v_empty_schools INT;
    v_directorates_dist JSON;
    v_complexes_dist JSON;
    v_avg_schools_per_complex NUMERIC;
BEGIN
    -- 1. العدادات الأساسية
    SELECT COUNT(*) INTO v_total_schools FROM schools;
    SELECT COUNT(*) INTO v_total_directorates FROM directorates;
    SELECT COUNT(*) INTO v_total_complexes FROM complexes;
    
    -- 2. المدارس الفارغة (بدون مدير)
    SELECT COUNT(*) INTO v_empty_schools
    FROM schools s
    LEFT JOIN user_schools us ON s.id = us.school_id
    WHERE us.user_id IS NULL;

    -- 3. متوسط عدد المدارس في كل مجمع (للبطاقة الجديدة)
    IF v_total_complexes > 0 THEN
        v_avg_schools_per_complex := ROUND(v_total_schools::NUMERIC / v_total_complexes::NUMERIC, 1);
    ELSE
        v_avg_schools_per_complex := 0;
    END IF;

    -- 4. توزيع المدارس حسب المديرية (للمخطط الدائري)
    SELECT json_object_agg(t.dname, t.cnt) INTO v_directorates_dist
    FROM (
        SELECT COALESCE(d.name, 'غير محدد') AS dname, COUNT(*) AS cnt
        FROM schools s
        LEFT JOIN directorates d ON s.directorate_id = d.id
        GROUP BY d.name
    ) t;

    -- 5. توزيع المجمعات حسب عدد المدارس (للمخطط الشريطي Bar Chart)
    -- يرجع اسم المجمع وعدد مدارسه
    SELECT json_agg(json_build_object('name', t.cname, 'count', t.cnt)) 
    INTO v_complexes_dist
    FROM (
        SELECT COALESCE(c.name, 'غير محدد') AS cname, COUNT(*) AS cnt
        FROM schools s
        LEFT JOIN complexes c ON s.complex_id = c.id
        GROUP BY c.name
        ORDER BY cnt DESC
        LIMIT 10 -- نرجع أكبر 10 مجمعات فقط
    ) t;

    -- 6. التجميع النهائي
    RETURN json_build_object(
        'cards', json_build_object(
            'total_schools', v_total_schools,
            'total_directorates', v_total_directorates,
            'total_complexes', v_total_complexes,
            'empty_schools_count', v_empty_schools,
            'avg_schools_per_complex', v_avg_schools_per_complex
        ),
        'charts', json_build_object(
            'directorates_distribution', COALESCE(v_directorates_dist, '{}'::json),
            'complexes_distribution', COALESCE(v_complexes_dist, '[]'::json)
        ),
        'generated_at', NOW()
    );
END;
$$;


ALTER FUNCTION public.fn_get_school_statistics() OWNER TO postgres;

--
-- TOC entry 277 (class 1255 OID 65547)
-- Name: fn_get_survey_analysis(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_survey_analysis(p_survey_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'question_id', q.id,
            'text', q.question_text,
            'type', qt.code,
            'stats',
                CASE qt.code

                    -- 🔹 أسئلة الاختيار
                    WHEN 'SINGLE_CHOICE' THEN (
                        SELECT json_object_agg(answer_value, cnt)
                        FROM (
                            SELECT sa.answer_value::TEXT, COUNT(*) cnt
                            FROM survey_answers sa
                            WHERE sa.question_id = q.id
                            GROUP BY sa.answer_value
                        ) t
                    )

                    WHEN 'MULTIPLE_CHOICE' THEN (
                        SELECT json_object_agg(val, cnt)
                        FROM (
                            SELECT value val, COUNT(*) cnt
                            FROM survey_answers sa,
                                 jsonb_array_elements_text(sa.answer_value::jsonb) value
                            WHERE sa.question_id = q.id
                            GROUP BY value
                        ) t
                    )

                    -- 🔹 أسئلة الأرقام
                    WHEN 'NUMBER' THEN (
                        SELECT json_build_object(
                            'average', ROUND(AVG((sa.answer_value)::NUMERIC), 2),
                            'min', MIN((sa.answer_value)::NUMERIC),
                            'max', MAX((sa.answer_value)::NUMERIC)
                        )
                        FROM survey_answers sa
                        WHERE sa.question_id = q.id
                    )

                    -- 🔹 أسئلة النصوص
                    ELSE (
                        SELECT json_agg(answer_value)
                        FROM (
                            SELECT sa.answer_value
                            FROM survey_answers sa
                            WHERE sa.question_id = q.id
                            ORDER BY sa.id DESC
                            LIMIT 5
                        ) t
                    )

                END
        )
        ORDER BY q.order_index
    )
    INTO v_result
    FROM survey_questions q
    JOIN question_types qt ON q.question_type_id = qt.id
    WHERE q.survey_id = p_survey_id;

    RETURN v_result;
END;
$$;


ALTER FUNCTION public.fn_get_survey_analysis(p_survey_id integer) OWNER TO postgres;

--
-- TOC entry 278 (class 1255 OID 65545)
-- Name: fn_get_survey_details(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_survey_details(p_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_res JSON;
BEGIN
    SELECT json_build_object(
        'id', s.id,
        'title', s.title,
        'description', s.description, 
        'status_id', s.status_id,
        'status_label', st.label,
        'is_periodic', s.is_periodic,
        'dates', json_build_object('start', s.start_date, 'end', s.end_date),
        'frequency_id', s.frequency_id,
        
        -- الأسئلة 
        'questions', COALESCE((
            SELECT json_agg(json_build_object(
                'id', q.id,
                'text', q.question_text,
                'type_id', q.question_type_id,
                'type_label', qt.label, 
                'required', q.is_required,
                'options', q.options_json,
                'logic', q.logic_rules
            ) ORDER BY q.order_index)
            FROM survey_questions q 
            JOIN question_types qt ON q.question_type_id = qt.id
            WHERE q.survey_id = s.id
        ), '[]'::json),
        
        -- المدارس المستهدفة
        'targets', COALESCE((
            SELECT json_agg(json_build_object('id', sch.id, 'name', sch.name))
            FROM survey_target_schools sts
            JOIN schools sch ON sts.school_id = sch.id
            WHERE sts.survey_id = s.id
        ), '[]'::json)
    ) INTO v_res
    FROM surveys s
    JOIN survey_statuses st ON s.status_id = st.id
    WHERE s.id = p_id;

    RETURN v_res;
END;
$$;


ALTER FUNCTION public.fn_get_survey_details(p_id integer) OWNER TO postgres;

--
-- TOC entry 281 (class 1255 OID 65550)
-- Name: fn_get_survey_profile(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_survey_profile(p_survey_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'id', s.id,
        'title', s.title,
        'description', s.description, -- الوصف مهم هنا (تعليمات التعبئة)
        'questions', COALESCE((
            SELECT json_agg(json_build_object(
                'id', q.id,
                'text', q.question_text,
                'type_id', q.question_type_id,
                'type_label', qt.label, 
                'type_code', qt.code,  
                'required', q.is_required,
                'options', q.options_json,
                'logic', q.logic_rules,
                'order', q.order_index
            ) ORDER BY q.order_index ASC)
            FROM survey_questions q 
            JOIN question_types qt ON q.question_type_id = qt.id
            WHERE q.survey_id = s.id
        ), '[]'::json)
    ) INTO v_result
    FROM surveys s
    WHERE s.id = p_survey_id;

    RETURN v_result;
END;
$$;


ALTER FUNCTION public.fn_get_survey_profile(p_survey_id integer) OWNER TO postgres;

--
-- TOC entry 285 (class 1255 OID 122884)
-- Name: fn_get_survey_schools_status(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_survey_schools_status(p_id integer) RETURNS TABLE(school_id integer, school_name character varying, status character varying, submitted_at timestamp without time zone, submitted_by character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT s.id, s.name, ts.code, r.submitted_at, u.username
    FROM survey_target_schools st 
    JOIN schools s ON st.school_id = s.id 
    JOIN target_statuses ts ON st.status_id = ts.id
    LEFT JOIN survey_responses r ON (st.survey_id=r.survey_id AND st.school_id=r.school_id) 
    LEFT JOIN users u ON r.submitted_by = u.id
    WHERE st.survey_id = p_id ORDER BY st.status_id DESC, s.name ASC;
END;
$$;


ALTER FUNCTION public.fn_get_survey_schools_status(p_id integer) OWNER TO postgres;

--
-- TOC entry 284 (class 1255 OID 122883)
-- Name: fn_get_survey_stats_summary(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_survey_stats_summary(p_id integer) RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE v_t INT; v_s INT; v_p INT;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status_id=2), COUNT(*) FILTER (WHERE status_id=1) 
    INTO v_t, v_s, v_p FROM survey_target_schools WHERE survey_id = p_id;
    RETURN json_build_object('total', v_t, 'submitted', v_s, 'pending', v_p, 'rate', CASE WHEN v_t > 0 THEN ROUND((v_s::NUMERIC/v_t)*100, 2) ELSE 0 END);
END;
$$;


ALTER FUNCTION public.fn_get_survey_stats_summary(p_id integer) OWNER TO postgres;

--
-- TOC entry 261 (class 1255 OID 155648)
-- Name: fn_get_survey_statuses(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_survey_statuses() RETURNS TABLE(id integer, code character varying, label character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT ss.id, ss.code, ss.label FROM survey_statuses ss ORDER BY id;
END;
$$;


ALTER FUNCTION public.fn_get_survey_statuses() OWNER TO postgres;

--
-- TOC entry 267 (class 1255 OID 49487)
-- Name: fn_get_user_details(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_user_details(p_user_id integer) RETURNS TABLE(id integer, username character varying, role_id integer, role_name character varying, schools json)
    LANGUAGE plpgsql
    AS $$--ادمن 
BEGIN
    RETURN QUERY
    SELECT 
        u.id, 
        u.username, 
        u.role_id,
        r.name AS role_name,
        COALESCE(
            json_agg(
                json_build_object('id', s.id, 'name', s.name)
            ) FILTER (WHERE s.id IS NOT NULL), 
            '[]'::json
        ) AS schools
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN user_schools us ON u.id = us.user_id
    LEFT JOIN schools s ON us.school_id = s.id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.username, u.role_id, r.name;
END;
$$;


ALTER FUNCTION public.fn_get_user_details(p_user_id integer) OWNER TO postgres;

--
-- TOC entry 269 (class 1255 OID 65537)
-- Name: fn_get_user_for_login(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_user_for_login(p_username_input character varying) RETURNS TABLE(id integer, username character varying, password character varying, role_id integer, role_name character varying, schools json)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, 
        u.username, 
        u.password, 
        u.role_id, 
        r.name AS role_name, -- جلب الاسم من جدول roles
        COALESCE(
            json_agg(json_build_object('id', s.id, 'name', s.name)) 
            FILTER (WHERE s.id IS NOT NULL), '[]'::json
        ) AS schools
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN user_schools us ON u.id = us.user_id
    LEFT JOIN schools s ON us.school_id = s.id
    WHERE u.username = p_username_input
    GROUP BY u.id, u.username, u.password, u.role_id, r.name;
END;
$$;


ALTER FUNCTION public.fn_get_user_for_login(p_username_input character varying) OWNER TO postgres;

--
-- TOC entry 272 (class 1255 OID 49489)
-- Name: fn_get_user_statistics(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_get_user_statistics() RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total INT;
    v_by_role JSON;
    v_orphans INT;
BEGIN
    SELECT COUNT(*) INTO v_total FROM users;

    SELECT json_object_agg(role_name, cnt) INTO v_by_role
    FROM (
        SELECT r.name AS role_name, COUNT(*) AS cnt
        FROM users u
        JOIN roles r ON u.role_id = r.id
        GROUP BY r.name
    ) t;

    -- 3. عدد مستخدمي المدارس الذين ليس لديهم أي مدرسة مرتبطة (Orphans)
    -- نبحث عن الدور الذي اسمه 'SCHOOL_USER' تحديداً
    SELECT COUNT(*) INTO v_orphans
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN user_schools us ON u.id = us.user_id
    WHERE r.name = 'SCHOOL_USER' AND us.school_id IS NULL;

    -- 4. تجميع النتيجة النهائية
    RETURN json_build_object(
        'total_users', v_total,
        'roles_distribution', COALESCE(v_by_role, '{}'::json),
        'users_without_schools', v_orphans,
        'generated_at', NOW()
    );
END;
$$;


ALTER FUNCTION public.fn_get_user_statistics() OWNER TO postgres;

--
-- TOC entry 275 (class 1255 OID 122880)
-- Name: fn_process_periodic_surveys(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_process_periodic_surveys() RETURNS integer
    LANGUAGE plpgsql
    AS $$DECLARE
    rec RECORD;
    v_new_survey_id INT;
    v_count INT := 0;
    v_start_date TIMESTAMP := NOW(); 
    v_end_date TIMESTAMP;
BEGIN
    FOR rec IN 
        SELECT s.*, f.interval_value 
        FROM surveys s
        JOIN frequencies f ON s.frequency_id = f.id
        WHERE s.is_periodic = TRUE 
        AND (
            s.last_run_at IS NULL 
            OR 
            v_start_date > (s.last_run_at + f.interval_value)
        )
    LOOP
	v_end_date := v_start_date + rec.interval_value;
        INSERT INTO surveys (
            title, description, status_id, is_periodic, 
            created_by, created_at, start_date, end_date, frequency_id
        ) 
        VALUES (
            rec.title || ' - ' || TO_CHAR(v_start_date, 'YYYY-MM-DD'), 
            rec.description, 
            2, 
            FALSE, 
            rec.created_by, 
            NOW(),
            v_start_date, 
            v_end_date, 
            rec.frequency_id
        )
        RETURNING id INTO v_new_survey_id;
        INSERT INTO survey_questions (
            survey_id, question_text, question_type_id, 
            is_required, options_json, order_index, logic_rules
        )
        SELECT 
            v_new_survey_id, question_text, question_type_id, 
            is_required, options_json, order_index, logic_rules
        FROM survey_questions 
        WHERE survey_id = rec.id;
        INSERT INTO survey_target_schools (survey_id, school_id, status_id)
        SELECT v_new_survey_id, school_id, 1 -- 1 = PENDING
        FROM survey_target_schools 
        WHERE survey_id = rec.id;

        UPDATE surveys 
        SET last_run_at = v_start_date 
        WHERE id = rec.id;
        v_count := v_count + 1;

    END LOOP;

    RETURN v_count; -- بيرجعلك كم استبيان جديد تم إنشاؤه
END;$$;


ALTER FUNCTION public.fn_process_periodic_surveys() OWNER TO postgres;

--
-- TOC entry 273 (class 1255 OID 65541)
-- Name: fn_publish_survey(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_publish_survey(p_id integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE 
    v_q INT; 
    v_t INT;
BEGIN
    SELECT COUNT(*) INTO v_q FROM survey_questions WHERE survey_id = p_id;
    SELECT COUNT(*) INTO v_t FROM survey_target_schools WHERE survey_id = p_id;
    
    IF v_q = 0 OR v_t = 0 THEN 
        RAISE EXCEPTION 'لا يمكن نشر استبيان فارغ أو بدون مدارس'; 
    END IF;

    -- 2 = ACTIVE
    UPDATE surveys SET status_id = 2 WHERE id = p_id;
END;
$$;


ALTER FUNCTION public.fn_publish_survey(p_id integer) OWNER TO postgres;

--
-- TOC entry 295 (class 1255 OID 122886)
-- Name: fn_set_survey_targets(integer, integer[], integer[], integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_set_survey_targets(p_survey_id integer, p_school_ids integer[], p_directorate_ids integer[], p_complex_ids integer[]) RETURNS integer
    LANGUAGE plpgsql
    AS $$ -- ترجع عدد المدارس التي تم استهدافها
DECLARE
    v_status_id INT;
    v_count INT;
BEGIN
    -- 1. التحقق من أن الاستبيان مسودة
    SELECT status_id INTO v_status_id FROM surveys WHERE id = p_survey_id;
    
    -- IF v_status_id != 2 THEN -- 1 = close
    --     RAISE EXCEPTION 'لا يمكن تعديل المستهدفين بعد النشر'; 
    -- END IF;

    -- 2. مسح الاستهدافات القديمة (لتحديث القائمة)
    DELETE FROM survey_target_schools WHERE survey_id = p_survey_id;

    -- 3. الإدراج الذكي (Smart Insert)
    INSERT INTO survey_target_schools (survey_id, school_id, status_id)
    SELECT DISTINCT p_survey_id, s.id, 1 -- 1 = PENDING
    FROM schools s
    WHERE 
        -- أ) المدارس المحددة بالاسم
        (p_school_ids IS NOT NULL AND s.id = ANY(p_school_ids))
        OR
        -- ب) كل مدارس المديريات المختارة
        (p_directorate_ids IS NOT NULL AND s.directorate_id = ANY(p_directorate_ids))
        OR
        -- ج) كل مدارس المجمعات المختارة
        (p_complex_ids IS NOT NULL AND s.complex_id = ANY(p_complex_ids));

    -- الحصول على عدد المدارس المضافة
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    IF v_count = 0 THEN
        RAISE EXCEPTION 'لم يتم العثور على أي مدرسة تطابق خيارات الاستهداف';
    END IF;

    RETURN v_count;
END;
$$;


ALTER FUNCTION public.fn_set_survey_targets(p_survey_id integer, p_school_ids integer[], p_directorate_ids integer[], p_complex_ids integer[]) OWNER TO postgres;

--
-- TOC entry 280 (class 1255 OID 65551)
-- Name: fn_submit_response(integer, integer, integer, jsonb); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_submit_response(p_survey_id integer, p_school_id integer, p_submitted_by integer, p_answers jsonb) RETURNS integer
    LANGUAGE plpgsql
    AS $$ 
DECLARE
    v_response_id INT;
    v_survey_status_id INT;
    v_target_status_id INT;
    v_question RECORD;
    v_found BOOLEAN;
    rec RECORD;
BEGIN
    -- أ) التحقق من أن الاستبيان نشط (ID = 2)
    SELECT status_id INTO v_survey_status_id FROM surveys WHERE id = p_survey_id;
    IF v_survey_status_id != 2 THEN
        RAISE EXCEPTION 'عذراً، هذا الاستبيان مغلق أو غير متاح.';
    END IF;

    -- ب) التحقق من أن المدرسة مستهدفة ولم تجب سابقاً (Status = 1 Pending)
    SELECT status_id INTO v_target_status_id 
    FROM survey_target_schools 
    WHERE survey_id = p_survey_id AND school_id = p_school_id;

    IF v_target_status_id IS NULL THEN
        RAISE EXCEPTION 'هذه المدرسة غير مخولة للمشاركة.';
    ELSIF v_target_status_id = 2 THEN -- 2 = Submitted
        RAISE EXCEPTION 'تم تسليم الإجابة مسبقاً.';
    END IF;

    -- ج) التحقق من الأسئلة الإجبارية
    FOR v_question IN SELECT id, question_text FROM survey_questions WHERE survey_id = p_survey_id AND is_required = TRUE
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM jsonb_array_elements(p_answers) AS el
            WHERE (el.value->>'questionId')::INT = v_question.id
            -- نتأكد أن القيمة موجودة وليست null 
            AND (el.value->'value') IS NOT NULL 
            AND (el.value->>'value') != '' -- في حال كانت نص فارغ
        ) INTO v_found;

        IF NOT v_found THEN
            RAISE EXCEPTION 'السؤال "%" إجباري ويجب الإجابة عليه.', v_question.question_text;
        END IF;
    END LOOP;

    -- د) إنشاء سجل الاستجابة
    INSERT INTO survey_responses (survey_id, school_id, submitted_by)
    VALUES (p_survey_id, p_school_id, p_submitted_by)
    RETURNING id INTO v_response_id;

    -- هـ) إدخال الإجابات التفصيلية
    FOR rec IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
        INSERT INTO survey_answers (response_id, question_id, answer_value)
        VALUES (
            v_response_id, 
            (rec.value->>'questionId')::INT, 
            rec.value->'value' -- نأخذ القيمة كـ JSONB كما هي ونخزنها
        );
    END LOOP;

    -- و) تحديث حالة المدرسة إلى SUBMITTED (ID = 2)
    UPDATE survey_target_schools
    SET status_id = 2
    WHERE survey_id = p_survey_id AND school_id = p_school_id;

    RETURN v_response_id;
END;
$$;


ALTER FUNCTION public.fn_submit_response(p_survey_id integer, p_school_id integer, p_submitted_by integer, p_answers jsonb) OWNER TO postgres;

--
-- TOC entry 286 (class 1255 OID 122882)
-- Name: fn_timeout_survey(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_timeout_survey(p_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$BEGIN
    UPDATE surveys 
    SET status_id = 3 
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'يا صديقي، الاستبيان رقم % مش موجود أصلاً!', p_id;
    END IF;

    RETURN 'تم الإغلاق بنجاح';
END;$$;


ALTER FUNCTION public.fn_timeout_survey(p_id integer) OWNER TO postgres;

--
-- TOC entry 283 (class 1255 OID 122881)
-- Name: fn_unpublish_survey(integer, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_unpublish_survey(p_id integer, p_reset boolean DEFAULT false) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM 1 FROM surveys WHERE id = p_id; IF NOT FOUND THEN RAISE EXCEPTION 'غير موجود'; END IF;
    IF p_reset THEN
        DELETE FROM survey_responses WHERE survey_id = p_id;
        UPDATE survey_target_schools SET status_id = 1 WHERE survey_id = p_id; -- 1 = Pending
    END IF;
    UPDATE surveys SET status_id = 1 WHERE id = p_id; -- 1 = Draft
    RETURN 'تم إيقاف النشر والعودة للمسودة';
END;
$$;


ALTER FUNCTION public.fn_unpublish_survey(p_id integer, p_reset boolean) OWNER TO postgres;

--
-- TOC entry 300 (class 1255 OID 57344)
-- Name: fn_update_school(integer, character varying, character varying, character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_school(p_id integer, p_name character varying DEFAULT NULL::character varying, p_code character varying DEFAULT NULL::character varying, p_region character varying DEFAULT NULL::character varying, p_directorate_id integer DEFAULT NULL::integer, p_complex_id integer DEFAULT NULL::integer) RETURNS void
    LANGUAGE plpgsql
    AS $$BEGIN
    UPDATE schools
    SET name = COALESCE(p_name, name),
        code = COALESCE(p_code, code),
        region = COALESCE(p_region, region),
        directorate_id = COALESCE(p_directorate_id, directorate_id),
        complex_id = COALESCE(p_complex_id, complex_id)
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'المدرسة غير موجودة';
    END IF;

-- قسم التقاط الأخطاء (Exception Handling)
EXCEPTION
    WHEN unique_violation THEN
        -- هذا الكود يعمل فقط لو ضرب قيد الـ Unique
        RAISE EXCEPTION 'عذراً، كود المدرسة "%" مستخدم بالفعل لمدرسة أخرى', p_code;
        
    WHEN foreign_key_violation THEN
        -- هذا الكود يعمل لو المديرية أو المجمع غير موجودين
        RAISE EXCEPTION 'عذراً، المديرية أو المجمع التعليمي غير موجود';
END;$$;


ALTER FUNCTION public.fn_update_school(p_id integer, p_name character varying, p_code character varying, p_region character varying, p_directorate_id integer, p_complex_id integer) OWNER TO postgres;

--
-- TOC entry 276 (class 1255 OID 65542)
-- Name: fn_update_survey(integer, character varying, text, boolean, timestamp without time zone, timestamp without time zone, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_survey(p_survey_id integer, p_title character varying DEFAULT NULL::character varying, p_description text DEFAULT NULL::text, p_is_periodic boolean DEFAULT NULL::boolean, p_start_date timestamp without time zone DEFAULT NULL::timestamp without time zone, p_end_date timestamp without time zone DEFAULT NULL::timestamp without time zone, p_frequency_id integer DEFAULT NULL::integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_status_id INT;
BEGIN
    -- التحقق من الحالة
    SELECT status_id INTO v_status_id FROM surveys WHERE id = p_survey_id FOR UPDATE;
    
    IF v_status_id IS NULL THEN
        RAISE EXCEPTION 'الاستبيان غير موجود';
    END IF;

    IF v_status_id != 1 THEN -- 1 = DRAFT
        RAISE EXCEPTION 'لا يمكن تعديل استبيان تم نشره أو إغلاقه';
    END IF;

    -- التحديث
    UPDATE surveys
    SET title = COALESCE(p_title, title),
        description = COALESCE(p_description, description),
        is_periodic = COALESCE(p_is_periodic, is_periodic),
        start_date = COALESCE(p_start_date, start_date),
        end_date = COALESCE(p_end_date, end_date),
        frequency_id = COALESCE(p_frequency_id, frequency_id)
    WHERE id = p_survey_id;
END;
$$;


ALTER FUNCTION public.fn_update_survey(p_survey_id integer, p_title character varying, p_description text, p_is_periodic boolean, p_start_date timestamp without time zone, p_end_date timestamp without time zone, p_frequency_id integer) OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 49484)
-- Name: fn_update_user(integer, character varying, integer, integer[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_update_user(p_user_id integer, p_user_name character varying DEFAULT NULL::character varying, p_role_id integer DEFAULT NULL::integer, p_school_ids integer[] DEFAULT NULL::integer[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- تحديث البيانات الأساسية
    UPDATE users
    SET username = COALESCE(p_user_name, username),
        role_id = COALESCE(p_role_id, role_id)
    WHERE id = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'المستخدم غير موجود';
    END IF;

    -- تحديث المدارس (جذفت كل الجداول الي كانت مرتبطاوعير موجوده في المصفوفه الجديده معو وعملت جداول جديه)
    IF p_school_ids IS NOT NULL THEN
        DELETE FROM user_schools 
        WHERE user_id = p_user_id 
        AND school_id NOT IN (SELECT unnest(p_school_ids));

        INSERT INTO user_schools (user_id, school_id)
        SELECT p_user_id, unnest(p_school_ids)
        ON CONFLICT (user_id, school_id) DO NOTHING; 
    END IF;
END;
$$;


ALTER FUNCTION public.fn_update_user(p_user_id integer, p_user_name character varying, p_role_id integer, p_school_ids integer[]) OWNER TO postgres;

--
-- TOC entry 293 (class 1255 OID 163845)
-- Name: fn_users_stats(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_users_stats() RETURNS json
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total bigint;
    v_by_role json;
    v_orphans bigint;
BEGIN
    SELECT COUNT(*) INTO v_total FROM users;

    SELECT json_object_agg(role_name, cnt) INTO v_by_role
    FROM (
        SELECT r.name AS role_name, COUNT(*) AS cnt
        FROM users u
        JOIN roles r ON u.role_id = r.id
        GROUP BY r.name
    ) t;

    SELECT COUNT(*) INTO v_orphans
    FROM users u
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN user_schools us ON u.id = us.user_id
    WHERE r.name = 'SCHOOL_USER'
      AND us.school_id IS NULL;

    RETURN json_build_object(
        'total_users', v_total,
        'roles_distribution', COALESCE(v_by_role, '{}'::json),
        'users_without_schools', v_orphans,
        'generated_at', NOW()
    );
END;
$$;


ALTER FUNCTION public.fn_users_stats() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 49250)
-- Name: complexes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complexes (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    directorate_id integer
);


ALTER TABLE public.complexes OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 49249)
-- Name: complexes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.complexes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complexes_id_seq OWNER TO postgres;

--
-- TOC entry 5186 (class 0 OID 0)
-- Dependencies: 231
-- Name: complexes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.complexes_id_seq OWNED BY public.complexes.id;


--
-- TOC entry 226 (class 1259 OID 49195)
-- Name: directorates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directorates (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.directorates OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 49194)
-- Name: directorates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directorates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directorates_id_seq OWNER TO postgres;

--
-- TOC entry 5187 (class 0 OID 0)
-- Dependencies: 225
-- Name: directorates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directorates_id_seq OWNED BY public.directorates.id;


--
-- TOC entry 224 (class 1259 OID 49186)
-- Name: frequencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.frequencies (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    interval_value interval
);


ALTER TABLE public.frequencies OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 49185)
-- Name: frequencies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.frequencies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.frequencies_id_seq OWNER TO postgres;

--
-- TOC entry 5188 (class 0 OID 0)
-- Dependencies: 223
-- Name: frequencies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.frequencies_id_seq OWNED BY public.frequencies.id;


--
-- TOC entry 228 (class 1259 OID 49207)
-- Name: question_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_types (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    label character varying(100) NOT NULL
);


ALTER TABLE public.question_types OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 49206)
-- Name: question_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_types_id_seq OWNER TO postgres;

--
-- TOC entry 5189 (class 0 OID 0)
-- Dependencies: 227
-- Name: question_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_types_id_seq OWNED BY public.question_types.id;


--
-- TOC entry 222 (class 1259 OID 49153)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 49152)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5190 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 234 (class 1259 OID 49264)
-- Name: schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schools (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    region character varying(100),
    directorate_id integer,
    complex_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.schools OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 49263)
-- Name: schools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schools_id_seq OWNER TO postgres;

--
-- TOC entry 5191 (class 0 OID 0)
-- Dependencies: 233
-- Name: schools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schools_id_seq OWNED BY public.schools.id;


--
-- TOC entry 219 (class 1259 OID 16680)
-- Name: survey_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_answers (
    id integer NOT NULL,
    response_id integer,
    question_id integer,
    answer_value text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.survey_answers OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16686)
-- Name: survey_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.survey_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_answers_id_seq OWNER TO postgres;

--
-- TOC entry 5192 (class 0 OID 0)
-- Dependencies: 220
-- Name: survey_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.survey_answers_id_seq OWNED BY public.survey_answers.id;


--
-- TOC entry 241 (class 1259 OID 49352)
-- Name: survey_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_questions (
    id integer NOT NULL,
    survey_id integer,
    question_text text NOT NULL,
    question_type_id integer,
    is_required boolean DEFAULT false,
    options_json jsonb DEFAULT '[]'::jsonb,
    logic_rules jsonb,
    order_index integer DEFAULT 0
);


ALTER TABLE public.survey_questions OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 49351)
-- Name: survey_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.survey_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_questions_id_seq OWNER TO postgres;

--
-- TOC entry 5193 (class 0 OID 0)
-- Dependencies: 240
-- Name: survey_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.survey_questions_id_seq OWNED BY public.survey_questions.id;


--
-- TOC entry 246 (class 1259 OID 49447)
-- Name: survey_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_responses (
    id integer NOT NULL,
    survey_id integer,
    school_id integer,
    submitted_by integer,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.survey_responses OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 49446)
-- Name: survey_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.survey_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_responses_id_seq OWNER TO postgres;

--
-- TOC entry 5194 (class 0 OID 0)
-- Dependencies: 245
-- Name: survey_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.survey_responses_id_seq OWNED BY public.survey_responses.id;


--
-- TOC entry 230 (class 1259 OID 49221)
-- Name: survey_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_statuses (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    label character varying(50)
);


ALTER TABLE public.survey_statuses OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 49220)
-- Name: survey_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.survey_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_statuses_id_seq OWNER TO postgres;

--
-- TOC entry 5195 (class 0 OID 0)
-- Dependencies: 229
-- Name: survey_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.survey_statuses_id_seq OWNED BY public.survey_statuses.id;


--
-- TOC entry 244 (class 1259 OID 49424)
-- Name: survey_target_schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_target_schools (
    survey_id integer NOT NULL,
    school_id integer NOT NULL,
    status_id integer
);


ALTER TABLE public.survey_target_schools OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 49323)
-- Name: surveys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.surveys (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status_id integer,
    is_periodic boolean DEFAULT false,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    frequency_id integer,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_run_at timestamp without time zone
);


ALTER TABLE public.surveys OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 49322)
-- Name: surveys_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.surveys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.surveys_id_seq OWNER TO postgres;

--
-- TOC entry 5196 (class 0 OID 0)
-- Dependencies: 238
-- Name: surveys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.surveys_id_seq OWNED BY public.surveys.id;


--
-- TOC entry 243 (class 1259 OID 49393)
-- Name: target_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.target_statuses (
    id integer NOT NULL,
    code character varying(50)
);


ALTER TABLE public.target_statuses OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 49392)
-- Name: target_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.target_statuses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.target_statuses_id_seq OWNER TO postgres;

--
-- TOC entry 5197 (class 0 OID 0)
-- Dependencies: 242
-- Name: target_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.target_statuses_id_seq OWNED BY public.target_statuses.id;


--
-- TOC entry 237 (class 1259 OID 49304)
-- Name: user_schools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_schools (
    user_id integer NOT NULL,
    school_id integer NOT NULL
);


ALTER TABLE public.user_schools OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 49287)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) CONSTRAINT users_full_name_not_null NOT NULL,
    password character varying(255) NOT NULL,
    role_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 49286)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5198 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4928 (class 2604 OID 49253)
-- Name: complexes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complexes ALTER COLUMN id SET DEFAULT nextval('public.complexes_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 49198)
-- Name: directorates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directorates ALTER COLUMN id SET DEFAULT nextval('public.directorates_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 49189)
-- Name: frequencies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frequencies ALTER COLUMN id SET DEFAULT nextval('public.frequencies_id_seq'::regclass);


--
-- TOC entry 4926 (class 2604 OID 49210)
-- Name: question_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_types ALTER COLUMN id SET DEFAULT nextval('public.question_types_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 49156)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 49267)
-- Name: schools id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools ALTER COLUMN id SET DEFAULT nextval('public.schools_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 16726)
-- Name: survey_answers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_answers ALTER COLUMN id SET DEFAULT nextval('public.survey_answers_id_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 49355)
-- Name: survey_questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_questions ALTER COLUMN id SET DEFAULT nextval('public.survey_questions_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 49450)
-- Name: survey_responses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_responses ALTER COLUMN id SET DEFAULT nextval('public.survey_responses_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 49224)
-- Name: survey_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_statuses ALTER COLUMN id SET DEFAULT nextval('public.survey_statuses_id_seq'::regclass);


--
-- TOC entry 4933 (class 2604 OID 49326)
-- Name: surveys id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys ALTER COLUMN id SET DEFAULT nextval('public.surveys_id_seq'::regclass);


--
-- TOC entry 4940 (class 2604 OID 49396)
-- Name: target_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.target_statuses ALTER COLUMN id SET DEFAULT nextval('public.target_statuses_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 49290)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5166 (class 0 OID 49250)
-- Dependencies: 232
-- Data for Name: complexes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complexes (id, name, directorate_id) FROM stdin;
1	مجمع المزة	1
2	مجمع البرامكة	1
3	مجمع تلدو	3
4	مجمع حماه	4
\.


--
-- TOC entry 5160 (class 0 OID 49195)
-- Dependencies: 226
-- Data for Name: directorates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.directorates (id, name) FROM stdin;
1	مديرية تربية دمشق
2	مديرية تربية ريف دمشق
3	مديريه تربية حمص
4	مديريه تربية حماه
\.


--
-- TOC entry 5158 (class 0 OID 49186)
-- Dependencies: 224
-- Data for Name: frequencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.frequencies (id, name, interval_value) FROM stdin;
1	مرة واحدة	\N
2	يومي	1 day
3	أسبوعي	7 days
4	شهري	1 mon
5	سنوي	1 year
\.


--
-- TOC entry 5162 (class 0 OID 49207)
-- Dependencies: 228
-- Data for Name: question_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.question_types (id, code, label) FROM stdin;
1	SHORT_TEXT	نص قصير
2	LONG_TEXT	نص طويل
3	SINGLE_CHOICE	اختيار واحد
4	MULTIPLE_CHOICE	اختيار متعدد
5	NUMBER	رقم
6	DATE	تاريخ
7	TIME	وقت
8	DATE_RANGE	مجال تاريخ
9	DATETIME_RANGE	مجال تاريخ ووقت
\.


--
-- TOC entry 5156 (class 0 OID 49153)
-- Dependencies: 222
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	ADMIN
2	SCHOOL_USER
3	ANALAYZER_USER
\.


--
-- TOC entry 5168 (class 0 OID 49264)
-- Dependencies: 234
-- Data for Name: schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schools (id, name, code, region, directorate_id, complex_id, created_at) FROM stdin;
5	ثانويه الامل	t234	تلدو	3	3	2026-01-18 15:51:09.995159
6	علي بكور	t345	تلدو	3	3	2026-01-18 15:51:46.05382
\.


--
-- TOC entry 5153 (class 0 OID 16680)
-- Dependencies: 219
-- Data for Name: survey_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_answers (id, response_id, question_id, answer_value, created_at) FROM stdin;
1	2	1	الأستاذ ماهر (مشرف إداري)	2026-01-16 17:37:10.085007
2	2	2	جيد جداً	2026-01-16 17:37:10.085007
3	2	3	7	2026-01-16 17:37:10.085007
4	3	1	الأستاذ ماهر (مشرف إداري)	2026-01-16 17:37:10.085007
5	3	2	جيد جداً	2026-01-16 17:37:10.085007
6	3	3	7	2026-01-16 17:37:10.085007
7	4	4	الأستاذ سعيد	2026-01-16 17:37:10.085007
8	4	5	جيدة	2026-01-16 17:37:10.085007
9	1	2	"الأستاذ حسان"	2026-01-16 17:37:10.085007
10	1	3	500	2026-01-16 17:37:10.085007
11	1	4	{"end": "2025-12-05", "start": "2025-12-01"}	2026-01-16 17:37:10.085007
12	1	5	"جيد"	2026-01-16 17:37:10.085007
13	1	1	50	2026-01-16 17:37:10.085007
46	34	89	66	2026-01-16 17:37:10.085007
47	35	69	7	2026-01-16 17:37:10.085007
48	36	123	[]	2026-01-16 17:37:10.085007
49	36	124	"ؤؤؤؤؤؤؤؤؤؤؤ"	2026-01-16 17:37:10.085007
50	40	125	"ثث"	2026-01-16 17:37:10.085007
51	40	135	4	2026-01-16 17:37:10.085007
52	42	123	["ccc"]	2026-01-16 17:37:10.085007
53	42	124	"لالالالالالالالالالالا"	2026-01-16 17:37:10.085007
54	42	127	"لالالالالالالالالالا"	2026-01-16 17:37:10.085007
55	42	128	"ببب"	2026-01-16 17:37:10.085007
56	42	129	22	2026-01-16 17:37:10.085007
57	42	130	"2026-01-20"	2026-01-16 17:37:10.085007
58	43	125	"2"	2026-01-16 17:37:10.085007
59	43	135	2	2026-01-16 17:37:10.085007
60	43	136	"ةىى"	2026-01-16 17:37:10.085007
61	44	145	"نعم"	2026-01-18 09:51:11.058122
62	45	139	"نعم"	2026-01-18 09:51:32.859285
63	45	138	"كذلك الامر"	2026-01-18 09:51:32.859285
64	45	136	"ةىى"	2026-01-18 09:51:32.859285
65	45	135	23	2026-01-18 09:51:32.859285
66	45	125	"كيفك "	2026-01-18 09:51:32.859285
67	46	145	"لا"	2026-01-18 09:52:45.29734
68	47	139	"لا"	2026-01-18 09:53:00.506961
69	47	138	"لا"	2026-01-18 09:53:00.506961
70	47	136	"ىىىىى"	2026-01-18 09:53:00.506961
71	47	135	4	2026-01-18 09:53:00.506961
72	47	125	"4لجبمبحملا"	2026-01-18 09:53:00.506961
\.


--
-- TOC entry 5175 (class 0 OID 49352)
-- Dependencies: 241
-- Data for Name: survey_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_questions (id, survey_id, question_text, question_type_id, is_required, options_json, logic_rules, order_index) FROM stdin;
123	75	cccc	4	t	["ccc", "ccc"]	null	0
124	75	cc	1	t	[]	null	0
125	76	ما هو اسمك الكامل؟ (سؤال إجباري)	1	t	[]	null	1
126	76	رقم هاتفك (اختياري)	5	f	[]	null	2
127	75	ةةةةةةةةةةةةة	2	t	[]	null	0
128	75	لالالالالالالالالالالالالالالالالا	3	t	["ببب", "رلا لا"]	null	0
129	75	 لالالالالالالالالالالا	5	t	[]	null	0
130	75	رررررررر	6	t	[]	null	0
135	76	ةةةةةةةة	5	t	[]	null	0
136	76	ىىىىى	3	t	["ةىى", "ىىىىى"]	null	0
137	77	mmmmmmm	1	t	[]	null	0
138	76	ffff	2	t	[]	null	0
139	76	cccccccccc	2	t	[]	null	0
140	78	cccccccccccccc	3	t	["cc", "ccc"]	null	0
141	80	رقم هاتفك (اختياري)	5	f	[]	null	2
142	80	رقم هاتفك (اختياري)	5	t	[]	null	2
143	80	رقم هاتفك (اختياري)	5	t	[]	null	2
144	100	هل الأرضيات نظيفة؟	1	t	[]	\N	1
145	81	هل الأرضيات نظيفة؟	1	t	[]	\N	1
146	82	fggggggggg	1	t	[]	null	0
147	84	mmmmmmmmmmmmmm	4	t	["mmmmmmmmmmmmmm", "jjjj"]	null	0
\.


--
-- TOC entry 5180 (class 0 OID 49447)
-- Dependencies: 246
-- Data for Name: survey_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_responses (id, survey_id, school_id, submitted_by, submitted_at) FROM stdin;
\.


--
-- TOC entry 5164 (class 0 OID 49221)
-- Dependencies: 230
-- Data for Name: survey_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_statuses (id, code, label) FROM stdin;
1	DRAFT	مسودة
2	ACTIVE	نشط
3	CLOSED	مغلق
\.


--
-- TOC entry 5178 (class 0 OID 49424)
-- Dependencies: 244
-- Data for Name: survey_target_schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.survey_target_schools (survey_id, school_id, status_id) FROM stdin;
\.


--
-- TOC entry 5173 (class 0 OID 49323)
-- Dependencies: 239
-- Data for Name: surveys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.surveys (id, title, description, status_id, is_periodic, start_date, end_date, frequency_id, created_by, created_at, last_run_at) FROM stdin;
82	gffffffffffffff	fggggggggggggggggg	3	f	2026-01-21 19:07:00	2026-01-29 19:07:00	\N	1	2026-01-16 16:07:20.57403	\N
81	استبيان النظافة الأسبوعي - 2026-01-15	تفقد نظافة الفصول	2	f	2026-01-15 14:23:00	\N	1	1	2026-01-15 14:23:14.54724	\N
83	 ogoororororor	rrrrrrrrrrrrrrrrrrrrrr	1	t	2026-01-31 19:26:00	2026-02-02 19:26:00	\N	1	2026-01-16 16:26:39.622579	\N
84	mmmmmmmmmmmmmm	mmmmmmmmmmmmm	3	f	2026-01-30 19:28:00	2026-02-04 19:28:00	\N	1	2026-01-16 16:28:48.809426	\N
77	morommmmmm	mororororro	3	f	2025-12-31 10:58:00	2026-01-10 11:00:00	\N	1	2026-01-10 07:25:40.619442	\N
75	mohammadkh	mororororo	2	t	2026-01-29 11:36:00	2026-01-31 11:36:00	\N	1	2026-01-09 20:36:55.910093	\N
78	ccccccccccc	ccccccccccccc	1	f	2026-01-22 13:54:00	2026-01-31 13:54:00	\N	1	2026-01-10 10:54:34.05395	\N
80	اختبار الأسئلة الإجبارية	تجربة لمنع الإجابة الناقصة	1	t	2026-01-01 10:00:00	2026-02-01 10:00:00	\N	1	2026-01-15 11:15:51.740867	\N
100	استبيان النظافة الأسبوعي	تفقد نظافة الفصول	1	t	\N	\N	1	1	2026-01-15 14:21:21.376519	2026-01-15 14:23:14.54724
79	اختبار الأسئلة الإجبارية	تجربة لمنع الإجابة الناقصة	2	f	2026-01-01 10:00:00	2026-02-01 10:00:00	\N	1	2026-01-15 11:15:43.805316	\N
76	تم تحويله لعادي	تجربة لمنع الإجابة الناقصةcc	2	t	2026-01-20 10:00:00	2026-01-25 10:00:00	\N	1	2026-01-09 20:53:19.828127	\N
\.


--
-- TOC entry 5177 (class 0 OID 49393)
-- Dependencies: 243
-- Data for Name: target_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.target_statuses (id, code) FROM stdin;
1	PENDING
2	SUBMITTED
\.


--
-- TOC entry 5171 (class 0 OID 49304)
-- Dependencies: 237
-- Data for Name: user_schools; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_schools (user_id, school_id) FROM stdin;
43	6
43	5
\.


--
-- TOC entry 5170 (class 0 OID 49287)
-- Dependencies: 236
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role_id, created_at) FROM stdin;
1	mohammad	$2b$10$t9xtzl2rkTOUYZBjnU1SBeaAOKqrBr5muEqXUcHC1vxJ5OB9vWpfa	1	2026-01-01 12:46:29.346387
40	Manager Ali	$2b$10$C9NvQxSdEnK6czmd8Qe7dO1n45jzEuz3Ydsnko3Ec6cV9sVLwZ7ia	2	2026-01-06 09:07:17.056546
43	User_1	$2b$10$IXyM.KYAJQz2zNP.QOE8AOvphTtjwwXL0DzgWtTFRF5dDa/x4IAdy	2	2026-01-18 15:52:38.359411
44	User_2	$2b$10$.F/IwIQ0K6OEub5JAt4WVeU0YpNj0SdsJlntxs1ycw.zpwMokIVdm	3	2026-01-18 15:52:50.171908
\.


--
-- TOC entry 5199 (class 0 OID 0)
-- Dependencies: 231
-- Name: complexes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complexes_id_seq', 1, false);


--
-- TOC entry 5200 (class 0 OID 0)
-- Dependencies: 225
-- Name: directorates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directorates_id_seq', 1, true);


--
-- TOC entry 5201 (class 0 OID 0)
-- Dependencies: 223
-- Name: frequencies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.frequencies_id_seq', 1, false);


--
-- TOC entry 5202 (class 0 OID 0)
-- Dependencies: 227
-- Name: question_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.question_types_id_seq', 1, false);


--
-- TOC entry 5203 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- TOC entry 5204 (class 0 OID 0)
-- Dependencies: 233
-- Name: schools_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schools_id_seq', 6, true);


--
-- TOC entry 5205 (class 0 OID 0)
-- Dependencies: 220
-- Name: survey_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_answers_id_seq', 72, true);


--
-- TOC entry 5206 (class 0 OID 0)
-- Dependencies: 240
-- Name: survey_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_questions_id_seq', 147, true);


--
-- TOC entry 5207 (class 0 OID 0)
-- Dependencies: 245
-- Name: survey_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_responses_id_seq', 47, true);


--
-- TOC entry 5208 (class 0 OID 0)
-- Dependencies: 229
-- Name: survey_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.survey_statuses_id_seq', 1, false);


--
-- TOC entry 5209 (class 0 OID 0)
-- Dependencies: 238
-- Name: surveys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.surveys_id_seq', 84, true);


--
-- TOC entry 5210 (class 0 OID 0)
-- Dependencies: 242
-- Name: target_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.target_statuses_id_seq', 1, false);


--
-- TOC entry 5211 (class 0 OID 0)
-- Dependencies: 235
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 44, true);


--
-- TOC entry 4966 (class 2606 OID 49257)
-- Name: complexes complexes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complexes
    ADD CONSTRAINT complexes_pkey PRIMARY KEY (id);


--
-- TOC entry 4954 (class 2606 OID 49204)
-- Name: directorates directorates_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directorates
    ADD CONSTRAINT directorates_name_key UNIQUE (name);


--
-- TOC entry 4956 (class 2606 OID 49202)
-- Name: directorates directorates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directorates
    ADD CONSTRAINT directorates_pkey PRIMARY KEY (id);


--
-- TOC entry 4952 (class 2606 OID 49193)
-- Name: frequencies frequencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.frequencies
    ADD CONSTRAINT frequencies_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 49217)
-- Name: question_types question_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_types
    ADD CONSTRAINT question_types_code_key UNIQUE (code);


--
-- TOC entry 4960 (class 2606 OID 49215)
-- Name: question_types question_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_types
    ADD CONSTRAINT question_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 49162)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4950 (class 2606 OID 49160)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 49275)
-- Name: schools schools_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_code_key UNIQUE (code);


--
-- TOC entry 4970 (class 2606 OID 49273)
-- Name: schools schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 16736)
-- Name: survey_answers survey_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_answers
    ADD CONSTRAINT survey_answers_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 49364)
-- Name: survey_questions survey_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 4986 (class 2606 OID 49454)
-- Name: survey_responses survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 49230)
-- Name: survey_statuses survey_statuses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_statuses
    ADD CONSTRAINT survey_statuses_code_key UNIQUE (code);


--
-- TOC entry 4964 (class 2606 OID 49228)
-- Name: survey_statuses survey_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_statuses
    ADD CONSTRAINT survey_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 49430)
-- Name: survey_target_schools survey_target_schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_target_schools
    ADD CONSTRAINT survey_target_schools_pkey PRIMARY KEY (survey_id, school_id);


--
-- TOC entry 4976 (class 2606 OID 49334)
-- Name: surveys surveys_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 49401)
-- Name: target_statuses target_statuses_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.target_statuses
    ADD CONSTRAINT target_statuses_code_key UNIQUE (code);


--
-- TOC entry 4982 (class 2606 OID 49399)
-- Name: target_statuses target_statuses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.target_statuses
    ADD CONSTRAINT target_statuses_pkey PRIMARY KEY (id);


--
-- TOC entry 4988 (class 2606 OID 49456)
-- Name: survey_responses unique_school_response; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT unique_school_response UNIQUE (survey_id, school_id);


--
-- TOC entry 4974 (class 2606 OID 49310)
-- Name: user_schools user_schools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_schools
    ADD CONSTRAINT user_schools_pkey PRIMARY KEY (user_id, school_id);


--
-- TOC entry 4972 (class 2606 OID 49298)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 1259 OID 16753)
-- Name: idx_answers_response; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_answers_response ON public.survey_answers USING btree (response_id);


--
-- TOC entry 4944 (class 1259 OID 196609)
-- Name: idx_survey_answers_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_survey_answers_question ON public.survey_answers USING btree (question_id);


--
-- TOC entry 4989 (class 2606 OID 49258)
-- Name: complexes complexes_directorate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complexes
    ADD CONSTRAINT complexes_directorate_id_fkey FOREIGN KEY (directorate_id) REFERENCES public.directorates(id) ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 49281)
-- Name: schools schools_complex_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_complex_id_fkey FOREIGN KEY (complex_id) REFERENCES public.complexes(id);


--
-- TOC entry 4991 (class 2606 OID 49276)
-- Name: schools schools_directorate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools
    ADD CONSTRAINT schools_directorate_id_fkey FOREIGN KEY (directorate_id) REFERENCES public.directorates(id);


--
-- TOC entry 4998 (class 2606 OID 49370)
-- Name: survey_questions survey_questions_question_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_question_type_id_fkey FOREIGN KEY (question_type_id) REFERENCES public.question_types(id);


--
-- TOC entry 4999 (class 2606 OID 49365)
-- Name: survey_questions survey_questions_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_questions
    ADD CONSTRAINT survey_questions_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;


--
-- TOC entry 5003 (class 2606 OID 49462)
-- Name: survey_responses survey_responses_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- TOC entry 5004 (class 2606 OID 49467)
-- Name: survey_responses survey_responses_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- TOC entry 5005 (class 2606 OID 49457)
-- Name: survey_responses survey_responses_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;


--
-- TOC entry 5000 (class 2606 OID 49436)
-- Name: survey_target_schools survey_target_schools_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_target_schools
    ADD CONSTRAINT survey_target_schools_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- TOC entry 5001 (class 2606 OID 49441)
-- Name: survey_target_schools survey_target_schools_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_target_schools
    ADD CONSTRAINT survey_target_schools_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.target_statuses(id);


--
-- TOC entry 5002 (class 2606 OID 49431)
-- Name: survey_target_schools survey_target_schools_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_target_schools
    ADD CONSTRAINT survey_target_schools_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 49345)
-- Name: surveys surveys_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 4996 (class 2606 OID 49340)
-- Name: surveys surveys_frequency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_frequency_id_fkey FOREIGN KEY (frequency_id) REFERENCES public.frequencies(id);


--
-- TOC entry 4997 (class 2606 OID 49335)
-- Name: surveys surveys_status_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surveys
    ADD CONSTRAINT surveys_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.survey_statuses(id);


--
-- TOC entry 4993 (class 2606 OID 49316)
-- Name: user_schools user_schools_school_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_schools
    ADD CONSTRAINT user_schools_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE CASCADE;


--
-- TOC entry 4994 (class 2606 OID 49311)
-- Name: user_schools user_schools_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_schools
    ADD CONSTRAINT user_schools_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 49299)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


-- Completed on 2026-01-19 08:23:52

--
-- PostgreSQL database dump complete
--

\unrestrict VdpPYkgKBVKDf8v1ewGeBsi2LeoB0rxvQnT0EeMaROzBTWKLi3vn7OCpWKdkcNX

