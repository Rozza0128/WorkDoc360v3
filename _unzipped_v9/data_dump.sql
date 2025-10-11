--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: companies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    trade_type character varying(100) NOT NULL,
    registration_number character varying(50),
    address text,
    postcode character varying(10),
    phone character varying(20),
    logo_url character varying,
    owner_id character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    business_type character varying(100) DEFAULT 'sole_trader'::character varying NOT NULL
);


ALTER TABLE public.companies OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO neondb_owner;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_branding; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.company_branding (
    id integer NOT NULL,
    company_id integer NOT NULL,
    website_url character varying,
    logo_url character varying,
    business_description text,
    tagline character varying,
    primary_colors text[],
    services text[],
    certifications text[],
    year_established character varying(4),
    key_personnel jsonb DEFAULT '[]'::jsonb,
    contact_info jsonb DEFAULT '{}'::jsonb,
    last_scraped timestamp without time zone,
    scraping_status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.company_branding OWNER TO neondb_owner;

--
-- Name: company_branding_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.company_branding_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_branding_id_seq OWNER TO neondb_owner;

--
-- Name: company_branding_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.company_branding_id_seq OWNED BY public.company_branding.id;


--
-- Name: company_users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.company_users (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    company_id integer NOT NULL,
    role character varying(50) DEFAULT 'worker'::character varying NOT NULL,
    joined_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.company_users OWNER TO neondb_owner;

--
-- Name: company_users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.company_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_users_id_seq OWNER TO neondb_owner;

--
-- Name: company_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.company_users_id_seq OWNED BY public.company_users.id;


--
-- Name: compliance_items; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.compliance_items (
    id integer NOT NULL,
    company_id integer NOT NULL,
    type character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    due_date date NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    assigned_to character varying,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.compliance_items OWNER TO neondb_owner;

--
-- Name: compliance_items_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.compliance_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.compliance_items_id_seq OWNER TO neondb_owner;

--
-- Name: compliance_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.compliance_items_id_seq OWNED BY public.compliance_items.id;


--
-- Name: cscs_cards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cscs_cards (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    company_id integer NOT NULL,
    card_number character varying(50) NOT NULL,
    card_type character varying(100) NOT NULL,
    issue_date date NOT NULL,
    expiry_date date NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.cscs_cards OWNER TO neondb_owner;

--
-- Name: cscs_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.cscs_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cscs_cards_id_seq OWNER TO neondb_owner;

--
-- Name: cscs_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.cscs_cards_id_seq OWNED BY public.cscs_cards.id;


--
-- Name: document_annotations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_annotations (
    id integer NOT NULL,
    document_id integer NOT NULL,
    user_id character varying NOT NULL,
    content text NOT NULL,
    annotation_type character varying(50) NOT NULL,
    section_reference character varying(255),
    line_number integer,
    status character varying(50) DEFAULT 'active'::character varying,
    parent_id integer,
    priority character varying(20) DEFAULT 'normal'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_annotations OWNER TO neondb_owner;

--
-- Name: document_annotations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_annotations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_annotations_id_seq OWNER TO neondb_owner;

--
-- Name: document_annotations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_annotations_id_seq OWNED BY public.document_annotations.id;


--
-- Name: document_assessments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_assessments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    uploaded_by character varying NOT NULL,
    original_file_name character varying(255) NOT NULL,
    document_type character varying(100) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_size integer,
    mime_type character varying(100),
    overall_score integer,
    assessment_status character varying(50) DEFAULT 'pending'::character varying,
    compliance_gaps jsonb,
    recommendations jsonb,
    strengths jsonb,
    critical_issues jsonb,
    improvement_plan jsonb,
    ai_analysis_log text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_assessments OWNER TO neondb_owner;

--
-- Name: document_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_assessments_id_seq OWNER TO neondb_owner;

--
-- Name: document_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_assessments_id_seq OWNED BY public.document_assessments.id;


--
-- Name: document_generation_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_generation_requests (
    id integer NOT NULL,
    company_id integer NOT NULL,
    user_id character varying NOT NULL,
    requested_documents text[] NOT NULL,
    generation_context jsonb NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    completed_documents integer DEFAULT 0,
    total_documents integer NOT NULL,
    error_message text,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_generation_requests OWNER TO neondb_owner;

--
-- Name: document_generation_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_generation_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_generation_requests_id_seq OWNER TO neondb_owner;

--
-- Name: document_generation_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_generation_requests_id_seq OWNED BY public.document_generation_requests.id;


--
-- Name: document_reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_reviews (
    id integer NOT NULL,
    document_id integer NOT NULL,
    reviewer_id character varying NOT NULL,
    review_type character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    comments text,
    reviewed_sections json,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_reviews OWNER TO neondb_owner;

--
-- Name: document_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_reviews_id_seq OWNER TO neondb_owner;

--
-- Name: document_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_reviews_id_seq OWNED BY public.document_reviews.id;


--
-- Name: document_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    document_type character varying(100) NOT NULL,
    template jsonb NOT NULL,
    trade_types character varying[],
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_templates OWNER TO neondb_owner;

--
-- Name: document_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_templates_id_seq OWNER TO neondb_owner;

--
-- Name: document_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_templates_id_seq OWNED BY public.document_templates.id;


--
-- Name: document_workflow; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_workflow (
    id integer NOT NULL,
    document_id integer NOT NULL,
    company_id integer NOT NULL,
    workflow_stage character varying(50) NOT NULL,
    assigned_to character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    due_date timestamp without time zone,
    completion_percentage integer DEFAULT 0,
    email_notifications_sent integer DEFAULT 0,
    last_notification_sent timestamp without time zone,
    next_notification_due timestamp without time zone,
    is_overdue boolean DEFAULT false,
    workflow_notes text,
    estimated_completion_time integer,
    actual_completion_time integer,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_workflow OWNER TO neondb_owner;

--
-- Name: document_workflow_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_workflow_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_workflow_id_seq OWNER TO neondb_owner;

--
-- Name: document_workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_workflow_id_seq OWNED BY public.document_workflow.id;


--
-- Name: email_notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_notifications (
    id integer NOT NULL,
    document_id integer,
    workflow_id integer,
    recipient_id character varying NOT NULL,
    recipient_email character varying(255) NOT NULL,
    notification_type character varying(50) NOT NULL,
    subject character varying(255) NOT NULL,
    content text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    sent_at timestamp without time zone,
    read_at timestamp without time zone,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.email_notifications OWNER TO neondb_owner;

--
-- Name: email_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_notifications_id_seq OWNER TO neondb_owner;

--
-- Name: email_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.email_notifications_id_seq OWNED BY public.email_notifications.id;


--
-- Name: generated_documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.generated_documents (
    id integer NOT NULL,
    company_id integer NOT NULL,
    template_type character varying(100) NOT NULL,
    document_name character varying(255) NOT NULL,
    site_name character varying(255) NOT NULL,
    site_address text NOT NULL,
    project_manager character varying(255) NOT NULL,
    hazards text,
    control_measures text,
    special_requirements text,
    status character varying(50) DEFAULT 'generated'::character varying,
    file_path character varying(500),
    file_url character varying(500),
    generated_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    template_id integer,
    is_template boolean DEFAULT false,
    review_status character varying(50) DEFAULT 'pending'::character varying,
    reviewed_by character varying,
    reviewed_at timestamp without time zone,
    approved_by character varying,
    approved_at timestamp without time zone
);


ALTER TABLE public.generated_documents OWNER TO neondb_owner;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.generated_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.generated_documents_id_seq OWNER TO neondb_owner;

--
-- Name: generated_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.generated_documents_id_seq OWNED BY public.generated_documents.id;


--
-- Name: method_statements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.method_statements (
    id integer NOT NULL,
    company_id integer NOT NULL,
    risk_assessment_id integer,
    title character varying(255) NOT NULL,
    description text,
    work_steps jsonb,
    equipment jsonb,
    ppe jsonb,
    emergency_procedures text,
    authorized_by character varying,
    status character varying(50) DEFAULT 'draft'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.method_statements OWNER TO neondb_owner;

--
-- Name: method_statements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.method_statements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.method_statements_id_seq OWNER TO neondb_owner;

--
-- Name: method_statements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.method_statements_id_seq OWNED BY public.method_statements.id;


--
-- Name: risk_assessments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.risk_assessments (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    location character varying(255),
    assessor_id character varying NOT NULL,
    status character varying(50) DEFAULT 'draft'::character varying,
    review_date date,
    hazards jsonb,
    control_measures jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.risk_assessments OWNER TO neondb_owner;

--
-- Name: risk_assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.risk_assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.risk_assessments_id_seq OWNER TO neondb_owner;

--
-- Name: risk_assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.risk_assessments_id_seq OWNED BY public.risk_assessments.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: toolbox_talks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.toolbox_talks (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title character varying(255) NOT NULL,
    topic character varying(100) NOT NULL,
    conducted_by character varying NOT NULL,
    location character varying(255),
    date date NOT NULL,
    attendees jsonb,
    key_points jsonb,
    hazards_discussed jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.toolbox_talks OWNER TO neondb_owner;

--
-- Name: toolbox_talks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.toolbox_talks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.toolbox_talks_id_seq OWNER TO neondb_owner;

--
-- Name: toolbox_talks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.toolbox_talks_id_seq OWNED BY public.toolbox_talks.id;


--
-- Name: two_factor_codes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.two_factor_codes (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    code character varying(6) NOT NULL,
    type character varying(20) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.two_factor_codes OWNER TO neondb_owner;

--
-- Name: two_factor_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.two_factor_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.two_factor_codes_id_seq OWNER TO neondb_owner;

--
-- Name: two_factor_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.two_factor_codes_id_seq OWNED BY public.two_factor_codes.id;


--
-- Name: upload_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.upload_sessions (
    id integer NOT NULL,
    company_id integer NOT NULL,
    uploaded_by character varying NOT NULL,
    session_name character varying(255),
    total_files integer DEFAULT 0,
    processed_files integer DEFAULT 0,
    status character varying(50) DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.upload_sessions OWNER TO neondb_owner;

--
-- Name: upload_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.upload_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: upload_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.upload_sessions_id_seq OWNED BY public.upload_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    profile_image_url character varying,
    email_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    selected_plan character varying(50) DEFAULT 'essential'::character varying,
    plan_status character varying(50) DEFAULT 'pending_payment'::character varying,
    subscription_type character varying(50) DEFAULT 'monthly'::character varying,
    contract_start_date timestamp without time zone,
    contract_end_date timestamp without time zone,
    next_billing_date timestamp without time zone,
    yearly_discount boolean DEFAULT false,
    two_factor_enabled boolean DEFAULT false,
    two_factor_secret character varying,
    backup_codes text[]
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: voucher_codes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.voucher_codes (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value integer,
    max_uses integer DEFAULT 1,
    used_count integer DEFAULT 0,
    valid_from timestamp without time zone DEFAULT now(),
    valid_until timestamp without time zone,
    applicable_plans text[],
    is_active boolean DEFAULT true,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.voucher_codes OWNER TO neondb_owner;

--
-- Name: voucher_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.voucher_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voucher_codes_id_seq OWNER TO neondb_owner;

--
-- Name: voucher_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.voucher_codes_id_seq OWNED BY public.voucher_codes.id;


--
-- Name: voucher_usage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.voucher_usage (
    id integer NOT NULL,
    voucher_id integer NOT NULL,
    user_id character varying NOT NULL,
    plan_applied character varying(50) NOT NULL,
    discount_amount integer NOT NULL,
    used_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.voucher_usage OWNER TO neondb_owner;

--
-- Name: voucher_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.voucher_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.voucher_usage_id_seq OWNER TO neondb_owner;

--
-- Name: voucher_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.voucher_usage_id_seq OWNED BY public.voucher_usage.id;


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_branding id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_branding ALTER COLUMN id SET DEFAULT nextval('public.company_branding_id_seq'::regclass);


--
-- Name: company_users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_users ALTER COLUMN id SET DEFAULT nextval('public.company_users_id_seq'::regclass);


--
-- Name: compliance_items id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.compliance_items ALTER COLUMN id SET DEFAULT nextval('public.compliance_items_id_seq'::regclass);


--
-- Name: cscs_cards id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cscs_cards ALTER COLUMN id SET DEFAULT nextval('public.cscs_cards_id_seq'::regclass);


--
-- Name: document_annotations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_annotations ALTER COLUMN id SET DEFAULT nextval('public.document_annotations_id_seq'::regclass);


--
-- Name: document_assessments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_assessments ALTER COLUMN id SET DEFAULT nextval('public.document_assessments_id_seq'::regclass);


--
-- Name: document_generation_requests id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_generation_requests ALTER COLUMN id SET DEFAULT nextval('public.document_generation_requests_id_seq'::regclass);


--
-- Name: document_reviews id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_reviews ALTER COLUMN id SET DEFAULT nextval('public.document_reviews_id_seq'::regclass);


--
-- Name: document_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_templates ALTER COLUMN id SET DEFAULT nextval('public.document_templates_id_seq'::regclass);


--
-- Name: document_workflow id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_workflow ALTER COLUMN id SET DEFAULT nextval('public.document_workflow_id_seq'::regclass);


--
-- Name: email_notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_notifications ALTER COLUMN id SET DEFAULT nextval('public.email_notifications_id_seq'::regclass);


--
-- Name: generated_documents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.generated_documents ALTER COLUMN id SET DEFAULT nextval('public.generated_documents_id_seq'::regclass);


--
-- Name: method_statements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.method_statements ALTER COLUMN id SET DEFAULT nextval('public.method_statements_id_seq'::regclass);


--
-- Name: risk_assessments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.risk_assessments ALTER COLUMN id SET DEFAULT nextval('public.risk_assessments_id_seq'::regclass);


--
-- Name: toolbox_talks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.toolbox_talks ALTER COLUMN id SET DEFAULT nextval('public.toolbox_talks_id_seq'::regclass);


--
-- Name: two_factor_codes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.two_factor_codes ALTER COLUMN id SET DEFAULT nextval('public.two_factor_codes_id_seq'::regclass);


--
-- Name: upload_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions ALTER COLUMN id SET DEFAULT nextval('public.upload_sessions_id_seq'::regclass);


--
-- Name: voucher_codes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voucher_codes ALTER COLUMN id SET DEFAULT nextval('public.voucher_codes_id_seq'::regclass);


--
-- Name: voucher_usage id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voucher_usage ALTER COLUMN id SET DEFAULT nextval('public.voucher_usage_id_seq'::regclass);


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.companies (id, name, trade_type, registration_number, address, postcode, phone, logo_url, owner_id, created_at, updated_at, business_type) FROM stdin;
1	Test Construction Ltd	scaffolder	SC123456	123 Construction Street, London, SW1A 1AA	\N	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.461539	2025-07-14 22:23:52.461539	sole_trader
12	Debug Company 2	general_contractor	12345678	123 Test Street, London	SW1A 1AA	+44 20 1234 5678	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:01:56.347457	2025-07-15 01:01:56.347457	limited_company
13	Frontend Test Company	electrician	87654321	456 Test Avenue, Manchester	M1 1AA	+44 161 1234 5678	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:03:22.15058	2025-07-15 01:03:22.15058	limited_company
14	Test1	general_contractor	12345678910	Own	B26 3RI	+447547416124	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:07:41.295625	2025-07-15 01:07:41.295625	sole_trader
15	Rob & Son Scaffolding Services Ltd	scaffolding	14567892	Birmingham, West Midlands	B77 4ET	+44 7837 781757	https://primary.jwwb.nl/public/n/u/h/temp-wehiizkggejfbjdybiao/r_s_logo-removebg-preview-high-0pghj1.png	user_1753112761151_mwwp72w7n	2025-07-21 15:46:01.232028	2025-07-21 15:46:01.232028	limited_company
\.


--
-- Data for Name: company_branding; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.company_branding (id, company_id, website_url, logo_url, business_description, tagline, primary_colors, services, certifications, year_established, key_personnel, contact_info, last_scraped, scraping_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: company_users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.company_users (id, user_id, company_id, role, joined_at) FROM stdin;
1	user_1752531382219_84afm2l0p	1	admin	2025-07-14 22:23:52.521809
2	user_1752531382219_84afm2l0p	1	admin	2025-07-14 22:23:52.573167
3	user_1752540941942_6iq9tasdg	12	admin	2025-07-15 01:01:56.399818
4	user_1752540941942_6iq9tasdg	12	admin	2025-07-15 01:01:56.448112
5	user_1752540941942_6iq9tasdg	13	admin	2025-07-15 01:03:22.200577
6	user_1752540941942_6iq9tasdg	13	admin	2025-07-15 01:03:22.248192
7	user_1752540941942_6iq9tasdg	14	admin	2025-07-15 01:07:41.357546
8	user_1752540941942_6iq9tasdg	14	admin	2025-07-15 01:07:41.409614
9	user_1753112761151_mwwp72w7n	15	admin	2025-07-21 15:46:01.34002
\.


--
-- Data for Name: compliance_items; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.compliance_items (id, company_id, type, title, description, due_date, status, priority, assigned_to, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: cscs_cards; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cscs_cards (id, user_id, company_id, card_number, card_type, issue_date, expiry_date, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: document_annotations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_annotations (id, document_id, user_id, content, annotation_type, section_reference, line_number, status, parent_id, priority, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_assessments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_assessments (id, company_id, uploaded_by, original_file_name, document_type, file_path, file_size, mime_type, overall_score, assessment_status, compliance_gaps, recommendations, strengths, critical_issues, improvement_plan, ai_analysis_log, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_generation_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_generation_requests (id, company_id, user_id, requested_documents, generation_context, status, completed_documents, total_documents, error_message, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_reviews (id, document_id, reviewer_id, review_type, status, comments, reviewed_sections, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_templates (id, name, description, category, document_type, template, trade_types, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: document_workflow; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_workflow (id, document_id, company_id, workflow_stage, assigned_to, priority, due_date, completion_percentage, email_notifications_sent, last_notification_sent, next_notification_due, is_overdue, workflow_notes, estimated_completion_time, actual_completion_time, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_notifications (id, document_id, workflow_id, recipient_id, recipient_email, notification_type, subject, content, status, sent_at, read_at, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: generated_documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.generated_documents (id, company_id, template_type, document_name, site_name, site_address, project_manager, hazards, control_measures, special_requirements, status, file_path, file_url, generated_by, created_at, updated_at, template_id, is_template, review_status, reviewed_by, reviewed_at, approved_by, approved_at) FROM stdin;
1	1	quality_manual	Quality Manual	Head Office	Company Registered Address	Quality Manager			{"title":"Quality Management System Manual","sections":[{"title":"1. Introduction and Scope","content":"This Quality Manual describes the Quality Management System (QMS) of {{company_name}}, a {{trade_type}} construction company established in {{establishment_year}}.\\n\\nOur QMS is designed to:\\n- Ensure consistent delivery of high-quality construction services\\n- Meet all applicable UK construction regulations and standards\\n- Continuously improve our processes and customer satisfaction\\n- Comply with ISO 9001:2015 requirements\\n\\nScope: This QMS covers all construction activities undertaken by {{company_name}}, including project planning, execution, quality control, and handover."},{"title":"2. Company Profile","content":"Company Name: {{company_name}}\\nRegistration Number: {{registration_number}}\\nAddress: {{company_address}}\\nTrade Specialisation: {{trade_specialisation}}\\nKey Personnel: {{key_personnel}}\\n\\nOur company specialises in delivering high-quality {{trade_type}} services across the UK construction sector."},{"title":"3. Quality Policy","content":"{{company_name}} is committed to:\\n\\n- Delivering construction services that meet or exceed customer expectations\\n- Complying with all applicable laws, regulations, and industry standards\\n- Maintaining a safe working environment for all personnel\\n- Continuously improving our quality management system\\n- Ensuring all personnel are competent and properly trained\\n\\nThis policy is communicated throughout the organisation and reviewed annually."},{"title":"4. Quality Management System","content":"Our QMS is based on the process approach and incorporates the Plan-Do-Check-Act (PDCA) cycle.\\n\\nKey Processes:\\n- Customer Requirements Management\\n- Project Planning and Design\\n- Resource Management\\n- Construction Execution\\n- Quality Control and Inspection\\n- Customer Satisfaction Monitoring\\n\\nProcess Documentation:\\nAll processes are documented in procedures, work instructions, and forms maintained in our quality system."},{"title":"5. Management Responsibility","content":"Top Management demonstrates leadership and commitment by:\\n- Taking accountability for the effectiveness of the QMS\\n- Establishing quality policy and objectives\\n- Ensuring integration of QMS requirements into business processes\\n- Promoting awareness of customer requirements\\n- Ensuring resources are available for the QMS\\n\\nManagement Representative: {{management_rep_name}}\\nResponsibilities include coordinating QMS activities and reporting to top management."},{"title":"6. Resource Management","content":"Human Resources:\\n- All personnel receive appropriate training and certification\\n- CSCS cards maintained for all site workers\\n- Regular competency assessments conducted\\n- Training records maintained\\n\\nInfrastructure:\\n- Construction equipment maintained according to schedules\\n- Calibration of measurement equipment\\n- IT systems for project management and documentation\\n\\nWork Environment:\\n- Health and safety procedures implemented\\n- Environmental considerations integrated into operations"},{"title":"7. Product Realisation","content":"Project Planning:\\n- Customer requirements reviewed and documented\\n- Risk assessments conducted for all projects\\n- Method statements prepared\\n- Resource allocation planned\\n\\nConstruction Execution:\\n- Work carried out according to approved plans and specifications\\n- Regular inspections and quality checks\\n- Non-conformances addressed immediately\\n- Progress monitoring and reporting\\n\\nQuality Control:\\n- Inspection and test plans implemented\\n- Material certificates verified\\n- Workmanship standards maintained\\n- Customer sign-offs obtained"},{"title":"8. Measurement and Improvement","content":"Monitoring and Measurement:\\n- Customer satisfaction surveys\\n- Internal quality audits\\n- Management reviews\\n- Process performance metrics\\n\\nContinuous Improvement:\\n- Corrective and preventive actions\\n- Lessons learned documentation\\n- Process improvements implemented\\n- Innovation encouraged\\n\\nData Analysis:\\n- Quality metrics tracked and analysed\\n- Trends identified and addressed\\n- Performance reported to management"}]}	template	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.642015	2025-07-14 22:23:52.642015	\N	t	pending	\N	\N	\N	\N
2	1	procedure	Document Control Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Document Control Procedure","sections":[{"title":"1. Purpose","content":"This procedure defines the controls needed to ensure that documents used within {{company_name}}'s Quality Management System are properly managed, current, and available where needed."},{"title":"2. Scope","content":"This procedure applies to all QMS documents including the Quality Manual, procedures, work instructions, forms, external documents, and records."},{"title":"3. Document Types","content":"Level 1: Quality Manual\\nLevel 2: Procedures\\nLevel 3: Work Instructions\\nLevel 4: Forms and Records\\nExternal Documents: Standards, regulations, customer specifications"},{"title":"4. Document Control Process","content":"Document Creation:\\n- Documents created using approved templates\\n- Reviewed by competent personnel\\n- Approved by authorised personnel before use\\n\\nDocument Distribution:\\n- Master copies maintained electronically\\n- Controlled copies distributed as needed\\n- Document lists maintained showing current versions\\n\\nDocument Updates:\\n- Changes reviewed and approved\\n- Version control maintained\\n- Superseded documents removed from use"}]}	template	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.642015	2025-07-14 22:23:52.642015	\N	t	pending	\N	\N	\N	\N
3	1	procedure	Management Review Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Management Review Procedure","sections":[{"title":"1. Purpose","content":"To define the process for management review of the Quality Management System to ensure its continuing suitability, adequacy, effectiveness, and alignment with strategic direction."},{"title":"2. Frequency","content":"Management reviews are conducted quarterly or when significant changes occur to the business or QMS."},{"title":"3. Review Inputs","content":"- Status of actions from previous management reviews\\n- Changes in external and internal issues relevant to the QMS\\n- Customer satisfaction and feedback\\n- Performance of processes and conformity of products/services\\n- Non-conformities and corrective actions\\n- Audit results\\n- Performance of external providers\\n- Adequacy of resources\\n- Opportunities for improvement"},{"title":"4. Review Outputs","content":"- Opportunities for improvement\\n- Any need for changes to the QMS\\n- Resource needs\\n- Actions to enhance customer satisfaction\\n- Changes to quality policy and objectives"}]}	template	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.642015	2025-07-14 22:23:52.642015	\N	t	pending	\N	\N	\N	\N
4	1	procedure	Internal Audit Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Internal Audit Procedure","sections":[{"title":"1. Purpose","content":"To define the process for conducting internal audits to provide information on whether the Quality Management System conforms to requirements and is effectively implemented."},{"title":"2. Audit Programme","content":"- Annual audit schedule established\\n- All QMS processes audited at least annually\\n- Frequency based on importance and results of previous audits\\n- Auditor competency requirements defined"},{"title":"3. Audit Process","content":"Planning:\\n- Audit objectives and scope defined\\n- Audit criteria established\\n- Auditors assigned (independent of area being audited)\\n\\nExecution:\\n- Opening meeting conducted\\n- Evidence gathered through interviews, observations, document review\\n- Findings documented and verified\\n- Closing meeting held\\n\\nReporting:\\n- Audit report prepared and distributed\\n- Non-conformities identified and documented\\n- Follow-up actions planned"}]}	template	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.642015	2025-07-14 22:23:52.642015	\N	t	pending	\N	\N	\N	\N
5	1	procedure	Corrective Action Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Corrective Action Procedure","sections":[{"title":"1. Purpose","content":"To define the process for eliminating the causes of non-conformities in order to prevent recurrence."},{"title":"2. Triggers for Corrective Action","content":"- Customer complaints\\n- Internal audit findings\\n- Management review outcomes\\n- Non-conforming work identified\\n- Process performance issues\\n- Supplier performance problems"},{"title":"3. Corrective Action Process","content":"1. Problem Identification and Description\\n2. Root Cause Analysis\\n3. Action Planning\\n4. Implementation\\n5. Effectiveness Review\\n6. Closure\\n\\nAll corrective actions are tracked in the Corrective Action Register with assigned responsibilities and target dates."}]}	template	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.642015	2025-07-14 22:23:52.642015	\N	t	pending	\N	\N	\N	\N
6	1	procedure	Customer Satisfaction Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Customer Satisfaction Procedure","sections":[{"title":"1. Purpose","content":"To define the process for monitoring customer satisfaction and perception of how well {{company_name}} meets customer expectations."},{"title":"2. Monitoring Methods","content":"- Customer satisfaction surveys\\n- Customer feedback forms\\n- Post-project reviews\\n- Complaint analysis\\n- Repeat business tracking\\n- Customer testimonials"},{"title":"3. Survey Process","content":"Surveys conducted for all major projects upon completion:\\n- Project quality assessment\\n- Timeliness evaluation\\n- Communication effectiveness\\n- Professional conduct rating\\n- Overall satisfaction score\\n- Likelihood to recommend\\n\\nResults analysed quarterly and trends identified for improvement opportunities."}]}	template	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.642015	2025-07-14 22:23:52.642015	\N	t	pending	\N	\N	\N	\N
7	1	policy	Health and Safety Policy	Head Office	Company Registered Address	Quality Manager			{"title":"Health and Safety Policy","sections":[{"title":"1. Policy Statement","content":"{{company_name}} is committed to ensuring the health, safety and welfare of all employees, subcontractors, and members of the public who may be affected by our construction activities.\\n\\nWe recognise that effective health and safety management is fundamental to successful business operation and will:\\n- Comply with all relevant health and safety legislation\\n- Provide safe working conditions and equipment\\n- Ensure adequate training and supervision\\n- Continuously improve our safety performance"},{"title":"2. Responsibilities","content":"Management:\\n- Provide leadership and resources for health and safety\\n- Ensure compliance with legal requirements\\n- Regular monitoring and review of safety performance\\n\\nSupervisors:\\n- Implement safety procedures on site\\n- Provide instruction and training to workers\\n- Monitor compliance and take corrective action\\n\\nAll Employees:\\n- Follow safety procedures and instructions\\n- Use provided safety equipment\\n- Report hazards and incidents immediately\\n- Participate in safety training"},{"title":"3. Risk Management","content":"Risk Assessment Process:\\n- Systematic identification of hazards\\n- Assessment of risks and control measures\\n- Regular review and updating\\n- Communication to all affected persons\\n\\nCommon Construction Hazards:\\n- Working at height\\n- Manual handling\\n- Plant and machinery\\n- Electrical hazards\\n- Hazardous substances\\n- Noise and vibration"}]}	template	\N	\N	user_1752531382219_84afm2l0p	2025-07-14 22:23:52.642015	2025-07-14 22:23:52.642015	\N	t	pending	\N	\N	\N	\N
8	12	policy	Health and Safety Policy	Head Office	Company Registered Address	Safety Manager			{"title":"Health and Safety Policy","sections":[{"title":"1. Policy Statement","content":"{{company_name}} is committed to ensuring the health, safety and welfare of all employees, subcontractors, and members of the public who may be affected by our construction activities.\\n\\nWe recognise that effective health and safety management is fundamental to successful business operation and will:\\n- Comply with all relevant health and safety legislation\\n- Provide safe working conditions and equipment\\n- Ensure adequate training and supervision\\n- Continuously improve our safety performance"},{"title":"2. Responsibilities","content":"Management:\\n- Provide leadership and resources for health and safety\\n- Ensure compliance with legal requirements\\n- Regular monitoring and review of safety performance\\n\\nSupervisors:\\n- Implement safety procedures on site\\n- Provide instruction and training to workers\\n- Monitor compliance and take corrective action\\n\\nAll Employees:\\n- Follow safety procedures and instructions\\n- Use provided safety equipment\\n- Report hazards and incidents immediately\\n- Participate in safety training"},{"title":"3. Risk Management","content":"Risk Assessment Process:\\n- Systematic identification of hazards\\n- Assessment of risks and control measures\\n- Regular review and updating\\n- Communication to all affected persons\\n\\nCommon Construction Hazards:\\n- Working at height\\n- Manual handling\\n- Plant and machinery\\n- Electrical hazards\\n- Hazardous substances\\n- Noise and vibration"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:01:56.504241	2025-07-15 01:01:56.504241	\N	t	pending	\N	\N	\N	\N
9	13	policy	Health and Safety Policy	Head Office	Company Registered Address	Safety Manager			{"title":"Health and Safety Policy","sections":[{"title":"1. Policy Statement","content":"{{company_name}} is committed to ensuring the health, safety and welfare of all employees, subcontractors, and members of the public who may be affected by our construction activities.\\n\\nWe recognise that effective health and safety management is fundamental to successful business operation and will:\\n- Comply with all relevant health and safety legislation\\n- Provide safe working conditions and equipment\\n- Ensure adequate training and supervision\\n- Continuously improve our safety performance"},{"title":"2. Responsibilities","content":"Management:\\n- Provide leadership and resources for health and safety\\n- Ensure compliance with legal requirements\\n- Regular monitoring and review of safety performance\\n\\nSupervisors:\\n- Implement safety procedures on site\\n- Provide instruction and training to workers\\n- Monitor compliance and take corrective action\\n\\nAll Employees:\\n- Follow safety procedures and instructions\\n- Use provided safety equipment\\n- Report hazards and incidents immediately\\n- Participate in safety training"},{"title":"3. Risk Management","content":"Risk Assessment Process:\\n- Systematic identification of hazards\\n- Assessment of risks and control measures\\n- Regular review and updating\\n- Communication to all affected persons\\n\\nCommon Construction Hazards:\\n- Working at height\\n- Manual handling\\n- Plant and machinery\\n- Electrical hazards\\n- Hazardous substances\\n- Noise and vibration"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:03:22.298591	2025-07-15 01:03:22.298591	\N	t	pending	\N	\N	\N	\N
10	14	policy	Health and Safety Policy	Head Office	Company Registered Address	Safety Manager			{"title":"Health and Safety Policy","sections":[{"title":"1. Policy Statement","content":"{{company_name}} is committed to ensuring the health, safety and welfare of all employees, subcontractors, and members of the public who may be affected by our construction activities.\\n\\nWe recognise that effective health and safety management is fundamental to successful business operation and will:\\n- Comply with all relevant health and safety legislation\\n- Provide safe working conditions and equipment\\n- Ensure adequate training and supervision\\n- Continuously improve our safety performance"},{"title":"2. Responsibilities","content":"Management:\\n- Provide leadership and resources for health and safety\\n- Ensure compliance with legal requirements\\n- Regular monitoring and review of safety performance\\n\\nSupervisors:\\n- Implement safety procedures on site\\n- Provide instruction and training to workers\\n- Monitor compliance and take corrective action\\n\\nAll Employees:\\n- Follow safety procedures and instructions\\n- Use provided safety equipment\\n- Report hazards and incidents immediately\\n- Participate in safety training"},{"title":"3. Risk Management","content":"Risk Assessment Process:\\n- Systematic identification of hazards\\n- Assessment of risks and control measures\\n- Regular review and updating\\n- Communication to all affected persons\\n\\nCommon Construction Hazards:\\n- Working at height\\n- Manual handling\\n- Plant and machinery\\n- Electrical hazards\\n- Hazardous substances\\n- Noise and vibration"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:07:41.461173	2025-07-15 01:07:41.461173	\N	t	pending	\N	\N	\N	\N
11	14	quality_manual	Quality Manual	Head Office	Company Registered Address	Quality Manager			{"title":"Quality Management System Manual","sections":[{"title":"1. Introduction and Scope","content":"This Quality Manual describes the Quality Management System (QMS) of {{company_name}}, a {{trade_type}} construction company established in {{establishment_year}}.\\n\\nOur QMS is designed to:\\n- Ensure consistent delivery of high-quality construction services\\n- Meet all applicable UK construction regulations and standards\\n- Continuously improve our processes and customer satisfaction\\n- Comply with ISO 9001:2015 requirements\\n\\nScope: This QMS covers all construction activities undertaken by {{company_name}}, including project planning, execution, quality control, and handover."},{"title":"2. Company Profile","content":"Company Name: {{company_name}}\\nRegistration Number: {{registration_number}}\\nAddress: {{company_address}}\\nTrade Specialisation: {{trade_specialisation}}\\nKey Personnel: {{key_personnel}}\\n\\nOur company specialises in delivering high-quality {{trade_type}} services across the UK construction sector."},{"title":"3. Quality Policy","content":"{{company_name}} is committed to:\\n\\n- Delivering construction services that meet or exceed customer expectations\\n- Complying with all applicable laws, regulations, and industry standards\\n- Maintaining a safe working environment for all personnel\\n- Continuously improving our quality management system\\n- Ensuring all personnel are competent and properly trained\\n\\nThis policy is communicated throughout the organisation and reviewed annually."},{"title":"4. Quality Management System","content":"Our QMS is based on the process approach and incorporates the Plan-Do-Check-Act (PDCA) cycle.\\n\\nKey Processes:\\n- Customer Requirements Management\\n- Project Planning and Design\\n- Resource Management\\n- Construction Execution\\n- Quality Control and Inspection\\n- Customer Satisfaction Monitoring\\n\\nProcess Documentation:\\nAll processes are documented in procedures, work instructions, and forms maintained in our quality system."},{"title":"5. Management Responsibility","content":"Top Management demonstrates leadership and commitment by:\\n- Taking accountability for the effectiveness of the QMS\\n- Establishing quality policy and objectives\\n- Ensuring integration of QMS requirements into business processes\\n- Promoting awareness of customer requirements\\n- Ensuring resources are available for the QMS\\n\\nManagement Representative: {{management_rep_name}}\\nResponsibilities include coordinating QMS activities and reporting to top management."},{"title":"6. Resource Management","content":"Human Resources:\\n- All personnel receive appropriate training and certification\\n- CSCS cards maintained for all site workers\\n- Regular competency assessments conducted\\n- Training records maintained\\n\\nInfrastructure:\\n- Construction equipment maintained according to schedules\\n- Calibration of measurement equipment\\n- IT systems for project management and documentation\\n\\nWork Environment:\\n- Health and safety procedures implemented\\n- Environmental considerations integrated into operations"},{"title":"7. Product Realisation","content":"Project Planning:\\n- Customer requirements reviewed and documented\\n- Risk assessments conducted for all projects\\n- Method statements prepared\\n- Resource allocation planned\\n\\nConstruction Execution:\\n- Work carried out according to approved plans and specifications\\n- Regular inspections and quality checks\\n- Non-conformances addressed immediately\\n- Progress monitoring and reporting\\n\\nQuality Control:\\n- Inspection and test plans implemented\\n- Material certificates verified\\n- Workmanship standards maintained\\n- Customer sign-offs obtained"},{"title":"8. Measurement and Improvement","content":"Monitoring and Measurement:\\n- Customer satisfaction surveys\\n- Internal quality audits\\n- Management reviews\\n- Process performance metrics\\n\\nContinuous Improvement:\\n- Corrective and preventive actions\\n- Lessons learned documentation\\n- Process improvements implemented\\n- Innovation encouraged\\n\\nData Analysis:\\n- Quality metrics tracked and analysed\\n- Trends identified and addressed\\n- Performance reported to management"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:12:04.000898	2025-07-15 01:12:04.000898	\N	t	pending	\N	\N	\N	\N
12	14	procedure	Document Control Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Document Control Procedure","sections":[{"title":"1. Purpose","content":"This procedure defines the controls needed to ensure that documents used within {{company_name}}'s Quality Management System are properly managed, current, and available where needed."},{"title":"2. Scope","content":"This procedure applies to all QMS documents including the Quality Manual, procedures, work instructions, forms, external documents, and records."},{"title":"3. Document Types","content":"Level 1: Quality Manual\\nLevel 2: Procedures\\nLevel 3: Work Instructions\\nLevel 4: Forms and Records\\nExternal Documents: Standards, regulations, customer specifications"},{"title":"4. Document Control Process","content":"Document Creation:\\n- Documents created using approved templates\\n- Reviewed by competent personnel\\n- Approved by authorised personnel before use\\n\\nDocument Distribution:\\n- Master copies maintained electronically\\n- Controlled copies distributed as needed\\n- Document lists maintained showing current versions\\n\\nDocument Updates:\\n- Changes reviewed and approved\\n- Version control maintained\\n- Superseded documents removed from use"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:12:04.000898	2025-07-15 01:12:04.000898	\N	t	pending	\N	\N	\N	\N
13	14	procedure	Management Review Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Management Review Procedure","sections":[{"title":"1. Purpose","content":"To define the process for management review of the Quality Management System to ensure its continuing suitability, adequacy, effectiveness, and alignment with strategic direction."},{"title":"2. Frequency","content":"Management reviews are conducted quarterly or when significant changes occur to the business or QMS."},{"title":"3. Review Inputs","content":"- Status of actions from previous management reviews\\n- Changes in external and internal issues relevant to the QMS\\n- Customer satisfaction and feedback\\n- Performance of processes and conformity of products/services\\n- Non-conformities and corrective actions\\n- Audit results\\n- Performance of external providers\\n- Adequacy of resources\\n- Opportunities for improvement"},{"title":"4. Review Outputs","content":"- Opportunities for improvement\\n- Any need for changes to the QMS\\n- Resource needs\\n- Actions to enhance customer satisfaction\\n- Changes to quality policy and objectives"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:12:04.000898	2025-07-15 01:12:04.000898	\N	t	pending	\N	\N	\N	\N
14	14	procedure	Internal Audit Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Internal Audit Procedure","sections":[{"title":"1. Purpose","content":"To define the process for conducting internal audits to provide information on whether the Quality Management System conforms to requirements and is effectively implemented."},{"title":"2. Audit Programme","content":"- Annual audit schedule established\\n- All QMS processes audited at least annually\\n- Frequency based on importance and results of previous audits\\n- Auditor competency requirements defined"},{"title":"3. Audit Process","content":"Planning:\\n- Audit objectives and scope defined\\n- Audit criteria established\\n- Auditors assigned (independent of area being audited)\\n\\nExecution:\\n- Opening meeting conducted\\n- Evidence gathered through interviews, observations, document review\\n- Findings documented and verified\\n- Closing meeting held\\n\\nReporting:\\n- Audit report prepared and distributed\\n- Non-conformities identified and documented\\n- Follow-up actions planned"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:12:04.000898	2025-07-15 01:12:04.000898	\N	t	pending	\N	\N	\N	\N
15	14	procedure	Corrective Action Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Corrective Action Procedure","sections":[{"title":"1. Purpose","content":"To define the process for eliminating the causes of non-conformities in order to prevent recurrence."},{"title":"2. Triggers for Corrective Action","content":"- Customer complaints\\n- Internal audit findings\\n- Management review outcomes\\n- Non-conforming work identified\\n- Process performance issues\\n- Supplier performance problems"},{"title":"3. Corrective Action Process","content":"1. Problem Identification and Description\\n2. Root Cause Analysis\\n3. Action Planning\\n4. Implementation\\n5. Effectiveness Review\\n6. Closure\\n\\nAll corrective actions are tracked in the Corrective Action Register with assigned responsibilities and target dates."}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:12:04.000898	2025-07-15 01:12:04.000898	\N	t	pending	\N	\N	\N	\N
16	14	procedure	Customer Satisfaction Procedure	Head Office	Company Registered Address	Quality Manager			{"title":"Customer Satisfaction Procedure","sections":[{"title":"1. Purpose","content":"To define the process for monitoring customer satisfaction and perception of how well {{company_name}} meets customer expectations."},{"title":"2. Monitoring Methods","content":"- Customer satisfaction surveys\\n- Customer feedback forms\\n- Post-project reviews\\n- Complaint analysis\\n- Repeat business tracking\\n- Customer testimonials"},{"title":"3. Survey Process","content":"Surveys conducted for all major projects upon completion:\\n- Project quality assessment\\n- Timeliness evaluation\\n- Communication effectiveness\\n- Professional conduct rating\\n- Overall satisfaction score\\n- Likelihood to recommend\\n\\nResults analysed quarterly and trends identified for improvement opportunities."}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:12:04.000898	2025-07-15 01:12:04.000898	\N	t	pending	\N	\N	\N	\N
17	14	policy	Health and Safety Policy	Head Office	Company Registered Address	Quality Manager			{"title":"Health and Safety Policy","sections":[{"title":"1. Policy Statement","content":"{{company_name}} is committed to ensuring the health, safety and welfare of all employees, subcontractors, and members of the public who may be affected by our construction activities.\\n\\nWe recognise that effective health and safety management is fundamental to successful business operation and will:\\n- Comply with all relevant health and safety legislation\\n- Provide safe working conditions and equipment\\n- Ensure adequate training and supervision\\n- Continuously improve our safety performance"},{"title":"2. Responsibilities","content":"Management:\\n- Provide leadership and resources for health and safety\\n- Ensure compliance with legal requirements\\n- Regular monitoring and review of safety performance\\n\\nSupervisors:\\n- Implement safety procedures on site\\n- Provide instruction and training to workers\\n- Monitor compliance and take corrective action\\n\\nAll Employees:\\n- Follow safety procedures and instructions\\n- Use provided safety equipment\\n- Report hazards and incidents immediately\\n- Participate in safety training"},{"title":"3. Risk Management","content":"Risk Assessment Process:\\n- Systematic identification of hazards\\n- Assessment of risks and control measures\\n- Regular review and updating\\n- Communication to all affected persons\\n\\nCommon Construction Hazards:\\n- Working at height\\n- Manual handling\\n- Plant and machinery\\n- Electrical hazards\\n- Hazardous substances\\n- Noise and vibration"}]}	template	\N	\N	user_1752540941942_6iq9tasdg	2025-07-15 01:12:04.000898	2025-07-15 01:12:04.000898	\N	t	pending	\N	\N	\N	\N
18	14	method-statement	method-statement - Goil	Goil	77 htuug	Rozza	\N	\N	\N	generated	/documents/method-statement-14-2025-07-15-1752543315854.pdf	https://safe-work-guide-paulroscoe14.replit.app/api/documents/method-statement-14-2025-07-15-1752543315854.pdf	user_1752540941942_6iq9tasdg	2025-07-15 01:35:15.876733	2025-07-15 01:35:15.876733	\N	f	pending	\N	\N	\N	\N
19	14	risk-assessment	risk-assessment - 6765	6765	7654	Tru	Children around	Standard	\N	generated	/documents/risk-assessment-14-2025-07-15-1752543367334.pdf	https://safe-work-guide-paulroscoe14.replit.app/api/documents/risk-assessment-14-2025-07-15-1752543367334.pdf	user_1752540941942_6iq9tasdg	2025-07-15 01:36:07.369456	2025-07-15 01:36:07.369456	\N	f	pending	\N	\N	\N	\N
20	15	scaffold-risk-assessment	Residential Scaffolding Risk Assessment - House Extensions Birmingham	Residential Property Development	Sutton Coldfield, Birmingham, B74 2NF	Rob Son	Working at height, Weather exposure, Public access areas, Adjacent properties	Family-run experienced team, Daily inspections, Weather monitoring, Resident liaison	Residential area considerations, Parking restrictions, Neighbour consultation	generated	/documents/scaffold-risk-assessment-15-1753112793318.txt	https://workdoc360.replit.app/api/documents/scaffold-risk-assessment-15-1753112793318.txt	user_1753112761151_mwwp72w7n	2025-07-21 15:46:33.337472	2025-07-21 15:46:33.337472	\N	f	approved	\N	\N	\N	\N
21	15	scaffold-method-statement	Commercial Scaffolding Method Statement - Business Park	Commercial Building Maintenance	Erdington Business Park, Birmingham, B24 9QR	Rob Son	Business operations, Vehicle access, Multi-storey access, Weather conditions	Professional scaffold design, Out-of-hours installation, Traffic management	Business continuity, Minimal disruption, Insurance compliance	generated	/documents/scaffold-method-statement-15-1753112793379.txt	https://workdoc360.replit.app/api/documents/scaffold-method-statement-15-1753112793379.txt	user_1753112761151_mwwp72w7n	2025-07-21 15:46:33.398662	2025-07-21 15:46:33.398662	\N	f	approved	\N	\N	\N	\N
22	15	scaffold-inspection-checklist	Industrial Scaffolding Weekly Inspection - Manufacturing Site	Industrial Manufacturing Facility	Castle Vale Industrial Estate, Birmingham, B35 7AG	Rob Son	Heavy-duty structures, Industrial processes, Health & safety regulations, Load requirements	Competent person inspections, Load calculations, Regular maintenance, Safety protocols	Industrial standards compliance, Worker safety priority, Regulatory adherence	generated	/documents/scaffold-inspection-checklist-15-1753112793427.txt	https://workdoc360.replit.app/api/documents/scaffold-inspection-checklist-15-1753112793427.txt	user_1753112761151_mwwp72w7n	2025-07-21 15:46:33.445814	2025-07-21 15:46:33.445814	\N	f	approved	\N	\N	\N	\N
23	15	scaffold-risk-assessment	Residential Scaffolding Risk Assessment - House Extensions Birmingham	Residential Property Development	Sutton Coldfield, Birmingham, B74 2NF	Rob Son	Working at height, Weather exposure, Public access areas, Adjacent properties	Family-run experienced team, Daily inspections, Weather monitoring, Resident liaison	Residential area considerations, Parking restrictions, Neighbour consultation	generated	/documents/scaffold-risk-assessment-15-1753113682911.txt	https://workdoc360.replit.app/api/documents/scaffold-risk-assessment-15-1753113682911.txt	user_1753112761151_mwwp72w7n	2025-07-21 16:01:22.930547	2025-07-21 16:01:22.930547	\N	f	approved	\N	\N	\N	\N
24	15	scaffold-method-statement	Commercial Scaffolding Method Statement - Business Park	Commercial Building Maintenance	Erdington Business Park, Birmingham, B24 9QR	Rob Son	Business operations, Vehicle access, Multi-storey access, Weather conditions	Professional scaffold design, Out-of-hours installation, Traffic management	Business continuity, Minimal disruption, Insurance compliance	generated	/documents/scaffold-method-statement-15-1753113682987.txt	https://workdoc360.replit.app/api/documents/scaffold-method-statement-15-1753113682987.txt	user_1753112761151_mwwp72w7n	2025-07-21 16:01:23.009166	2025-07-21 16:01:23.009166	\N	f	approved	\N	\N	\N	\N
25	15	scaffold-inspection-checklist	Industrial Scaffolding Weekly Inspection - Manufacturing Site	Industrial Manufacturing Facility	Castle Vale Industrial Estate, Birmingham, B35 7AG	Rob Son	Heavy-duty structures, Industrial processes, Health & safety regulations, Load requirements	Competent person inspections, Load calculations, Regular maintenance, Safety protocols	Industrial standards compliance, Worker safety priority, Regulatory adherence	generated	/documents/scaffold-inspection-checklist-15-1753113683037.txt	https://workdoc360.replit.app/api/documents/scaffold-inspection-checklist-15-1753113683037.txt	user_1753112761151_mwwp72w7n	2025-07-21 16:01:23.056574	2025-07-21 16:01:23.056574	\N	f	approved	\N	\N	\N	\N
26	15	scaffold-risk-assessment	Residential Scaffolding Risk Assessment - House Extensions Birmingham	Residential Property Development	Sutton Coldfield, Birmingham, B74 2NF	Rob Son	Working at height, Weather exposure, Public access areas, Adjacent properties	Family-run experienced team, Daily inspections, Weather monitoring, Resident liaison	Residential area considerations, Parking restrictions, Neighbour consultation	generated	/documents/scaffold-risk-assessment-15-1753113832748.txt	https://workdoc360.replit.app/api/documents/scaffold-risk-assessment-15-1753113832748.txt	user_1753112761151_mwwp72w7n	2025-07-21 16:03:52.768807	2025-07-21 16:03:52.768807	\N	f	approved	\N	\N	\N	\N
27	15	scaffold-method-statement	Commercial Scaffolding Method Statement - Business Park	Commercial Building Maintenance	Erdington Business Park, Birmingham, B24 9QR	Rob Son	Business operations, Vehicle access, Multi-storey access, Weather conditions	Professional scaffold design, Out-of-hours installation, Traffic management	Business continuity, Minimal disruption, Insurance compliance	generated	/documents/scaffold-method-statement-15-1753113832795.txt	https://workdoc360.replit.app/api/documents/scaffold-method-statement-15-1753113832795.txt	user_1753112761151_mwwp72w7n	2025-07-21 16:03:52.815012	2025-07-21 16:03:52.815012	\N	f	approved	\N	\N	\N	\N
28	15	scaffold-inspection-checklist	Industrial Scaffolding Weekly Inspection - Manufacturing Site	Industrial Manufacturing Facility	Castle Vale Industrial Estate, Birmingham, B35 7AG	Rob Son	Heavy-duty structures, Industrial processes, Health & safety regulations, Load requirements	Competent person inspections, Load calculations, Regular maintenance, Safety protocols	Industrial standards compliance, Worker safety priority, Regulatory adherence	generated	/documents/scaffold-inspection-checklist-15-1753113832842.txt	https://workdoc360.replit.app/api/documents/scaffold-inspection-checklist-15-1753113832842.txt	user_1753112761151_mwwp72w7n	2025-07-21 16:03:52.860791	2025-07-21 16:03:52.860791	\N	f	approved	\N	\N	\N	\N
\.


--
-- Data for Name: method_statements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.method_statements (id, company_id, risk_assessment_id, title, description, work_steps, equipment, ppe, emergency_procedures, authorized_by, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: risk_assessments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.risk_assessments (id, company_id, title, description, location, assessor_id, status, review_date, hazards, control_measures, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (sid, sess, expire) FROM stdin;
VUSeyM-WEdul-CdjeKmR1xcJiReAp8vX	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-28T16:27:34.247Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "user_1753112761151_mwwp72w7n"}}	2025-07-28 16:31:54
m550xbBzUoCXBkrCh5fBcidDOkSQgxjZ	{"cookie": {"path": "/", "secure": true, "expires": "2025-07-30T21:10:06.718Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "user_1753305006182_fttx0qyxl"}}	2025-07-30 21:24:29
uzI7JjfTFCctyyElVoZfSm6q6D-XZgq9	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-29T15:29:09.042Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1753112761151_mwwp72w7n"}}	2025-07-29 15:29:10
FNjdUaW2BLz5yASwJiWmOKdjKDrNknGf	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-29T16:11:23.369Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1753112761151_mwwp72w7n"}}	2025-07-31 07:55:17
VrGwGv--jSg7y_zrEYsHgob3jnatKfbp	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-31T07:55:58.001Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1752540647534_0stxfklis"}}	2025-07-31 07:55:59
b5Uz-yBac2ScBA4xiBC9P7olUu8wN0C4	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-29T15:29:15.088Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1753198154953_hhinnrp7q"}}	2025-07-29 15:29:16
n7v8JTtdYdqlVSEU18h7zy6v0KYEZ_UN	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-28T16:52:01.384Z", "httpOnly": true, "originalMaxAge": 604800000}, "passport": {"user": "user_1753112761151_mwwp72w7n"}}	2025-07-28 16:52:17
eYp6uZTMFPOtYO4fy0FsdoTwM_SjnmGc	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-31T08:02:22.223Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1753112761151_mwwp72w7n"}}	2025-07-31 08:02:35
65WcJjbPTsmt33Ox9lLOkg-u-S9I7f9c	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-29T15:29:08.630Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1753112761151_mwwp72w7n"}}	2025-07-29 15:29:09
BvLklM3DleFzpptmOvOxdectAcMbYlGg	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-29T15:29:16.000Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1753198154953_hhinnrp7q"}}	2025-07-29 15:29:36
NhWsTBAD20X-2PsHxqN9hA-0cUsK2XWR	{"cookie": {"path": "/", "secure": false, "expires": "2025-07-29T16:08:51.681Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "passport": {"user": "user_1753112761151_mwwp72w7n"}}	2025-07-29 16:09:42
\.


--
-- Data for Name: toolbox_talks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.toolbox_talks (id, company_id, title, topic, conducted_by, location, date, attendees, key_points, hazards_discussed, created_at) FROM stdin;
\.


--
-- Data for Name: two_factor_codes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.two_factor_codes (id, user_id, code, type, expires_at, verified, created_at) FROM stdin;
\.


--
-- Data for Name: upload_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.upload_sessions (id, company_id, uploaded_by, session_name, total_files, processed_files, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, first_name, last_name, profile_image_url, email_verified, created_at, updated_at, selected_plan, plan_status, subscription_type, contract_start_date, contract_end_date, next_billing_date, yearly_discount, two_factor_enabled, two_factor_secret, backup_codes) FROM stdin;
user_1752531382219_84afm2l0p	test@workdoc360.com	df00c3ceca6e32175167c67aa6b995dabc52ef3f35bea423b87242e3937eecfacc2419dd06b0f98ba553fed70bc7ced49ce9ad8b3b0573bca25061bd856823f1.d1eb6fa6278291a59884798f77323c73	Paul	Tester	\N	f	2025-07-14 22:16:22.239025	2025-07-14 22:16:22.239025	essential	trial	monthly	\N	\N	\N	f	f	\N	\N
user_1752534887337_vnd4873fo	paulroscoe14@gmail.com	a1ee63d6ec45b39df796a02d575eb5327866878fa47c9d7cae0e757e308956d8917df9b44469e8370a568ae50249dde6b99fff425c07c3c4692459630f4113df.6c966c78d964f09949d562f465f3aded	Paul	Roscoe	\N	f	2025-07-14 23:14:47.356975	2025-07-14 23:14:47.356975	essential	trial	monthly	\N	\N	\N	f	f	\N	\N
user_1752538144751_czlwws726	sarah@workdoc360.com	c3e452bdc194cca7f6ed9ca78ae4295edccb684b2f469712296002a4f90f033ca1ed3ec6c1dbcb5e1b133a434659973bcdcac51b527b7fc2b6e7ffeb291982c5.22c987b50a59350113b8f0b227675592	Sarah	Builder	\N	f	2025-07-15 00:09:04.769608	2025-07-15 00:09:04.769608	essential	pending_payment	monthly	\N	\N	\N	f	f	\N	\N
user_1752538530600_yjjq4pzm1	test2fa@workdoc360.com	2f9760cbecf64d1f2e000d51b10b1376f55a7b6048f4c5a212215eabe1775129e5126b43689afe08e7cf9bc4139c3ed0265dedd5d6d0af17ef63e40fb40bc968.2e50443bb3b21581d0ef909d66e75bbd	Test	TwoFA	\N	f	2025-07-15 00:15:30.620698	2025-07-15 00:15:30.620698	essential	trial	monthly	\N	\N	\N	f	f	\N	\N
user_1752540647534_0stxfklis	test@example.com	18f08c62922f8cb91b38217fe8045b339645672abd1c0d80926183b8a199bddaeb53ed62ff05c498a178549712a684e807f7139dabf65f910cdef7345ce5b381.166e7a64745694a5d7b534c00ca69bf8	Test	User	\N	f	2025-07-15 00:50:47.554848	2025-07-15 00:50:47.554848	essential	trial	monthly	\N	\N	\N	f	f	\N	\N
user_1752540657971_b2nmeo7yr	test2@example.com	51225ae7534964cf01e90a217afd3fdaf7ccb22aea4d4d78692a0ca260f4ccaa9278c5a43a51ba126feadfb9e8211c43dcc2dd4df92c74ba90dd7aea197922f3.ece25bef17e8b0a7231495d5425fb835	Jane	Smith	\N	f	2025-07-15 00:50:57.991778	2025-07-15 00:50:57.991778	essential	trial	monthly	\N	\N	\N	f	f	\N	\N
user_1752540941942_6iq9tasdg	admin@workdoc360.com	fa6e95bcc1e4da316f966d6e3086ff82dbffd6417b87e82b251e315717cad4e06509fde214b243301615bc5aeb4c6588cfab5e888c35b7c569854f54df04e729.8fcd73279f45998f4395bd7225bcdd41	Admin	User	\N	f	2025-07-15 00:55:41.961163	2025-07-15 00:55:41.961163	essential	trial	monthly	\N	\N	\N	f	f	\N	\N
user_1753112761151_mwwp72w7n	info@rnsscaff.co.uk	3250fdb25aa1ced156e6bb96e000c3c9ada01e6d4c799ec1c2f66bdf16f577a630b2b3be16a082d96ffcf5b9c2147272a2eadcbbe1c511d9f13c08d4413218c0.7fa7fdcb62b79d8a1e7e22deb34a82d3	Rob	Son	https://primary.jwwb.nl/public/n/u/h/temp-wehiizkggejfbjdybiao/r_s_logo-removebg-preview-high-0pghj1.png	t	2025-07-21 15:46:01.168952	2025-07-21 16:03:52.61	professional	active	yearly	2025-07-21 15:46:01.15	2026-07-21 15:46:01.15	2026-07-21 15:46:01.15	t	f	\N	\N
user_1753198154953_hhinnrp7q	test.voucher@example.com	aa990f5400d50a3e1065e609c43702d33bb994abf7689ccbce00945d8aea14d0d52aba071844a8e2a45e8db6448e0dd9ede75d58382974b4b5cffa1dfb3d8fc4.fb3374d94c07ba70f1ecfa657d1ee00e	Test	User	\N	f	2025-07-22 15:29:14.972782	2025-07-22 15:29:23.582	essential	active	yearly	2025-07-22 15:29:23.581	2026-07-22 15:29:23.581	2026-07-22 15:29:23.581	f	f	\N	\N
user_1753305006182_fttx0qyxl	jamie.ben.curry@gmail.com	713c36bcb193c51e29fa64e7e552e806e5a8ecea71d260d02fa5751ca635fa4939c489de249ce0f8b3742c3ffcfacbe04d252070363238a526f2f9d17551d2e9.ce8e549c18d029717a3226651b78703d	Jamie	Curry	\N	f	2025-07-23 21:10:06.203462	2025-07-23 21:10:06.203462	essential	pending_payment	monthly	\N	\N	\N	f	f	\N	\N
\.


--
-- Data for Name: voucher_codes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.voucher_codes (id, code, description, discount_type, discount_value, max_uses, used_count, valid_from, valid_until, applicable_plans, is_active, created_by, created_at, updated_at) FROM stdin;
2	DISCOUNT50	50% discount voucher	percentage	50	5	0	2025-07-22 15:26:07.102229	2025-12-31 23:59:59	{essential,professional}	t	system	2025-07-22 15:26:07.102229	2025-07-22 15:26:07.102229
3	SAVE100	£100 off voucher	fixed_amount	10000	3	0	2025-07-22 15:26:07.102229	2025-12-31 23:59:59	{professional,enterprise}	t	system	2025-07-22 15:26:07.102229	2025-07-22 15:26:07.102229
1	TESTFREE2025	Free access test voucher	bypass_payment	0	10	1	2025-07-22 15:26:07.102229	2025-12-31 23:59:59	{micro,essential}	t	system	2025-07-22 15:26:07.102229	2025-07-22 15:29:23.629
\.


--
-- Data for Name: voucher_usage; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.voucher_usage (id, voucher_id, user_id, plan_applied, discount_amount, used_at) FROM stdin;
1	1	user_1753198154953_hhinnrp7q	essential	0	2025-07-22 15:29:23.54025
\.


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.companies_id_seq', 15, true);


--
-- Name: company_branding_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.company_branding_id_seq', 1, false);


--
-- Name: company_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.company_users_id_seq', 9, true);


--
-- Name: compliance_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.compliance_items_id_seq', 1, false);


--
-- Name: cscs_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.cscs_cards_id_seq', 1, false);


--
-- Name: document_annotations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.document_annotations_id_seq', 1, false);


--
-- Name: document_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.document_assessments_id_seq', 1, false);


--
-- Name: document_generation_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.document_generation_requests_id_seq', 1, false);


--
-- Name: document_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.document_reviews_id_seq', 1, false);


--
-- Name: document_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.document_templates_id_seq', 1, false);


--
-- Name: document_workflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.document_workflow_id_seq', 1, false);


--
-- Name: email_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_notifications_id_seq', 1, false);


--
-- Name: generated_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.generated_documents_id_seq', 28, true);


--
-- Name: method_statements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.method_statements_id_seq', 1, false);


--
-- Name: risk_assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.risk_assessments_id_seq', 1, false);


--
-- Name: toolbox_talks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.toolbox_talks_id_seq', 1, false);


--
-- Name: two_factor_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.two_factor_codes_id_seq', 1, false);


--
-- Name: upload_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.upload_sessions_id_seq', 1, false);


--
-- Name: voucher_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.voucher_codes_id_seq', 3, true);


--
-- Name: voucher_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.voucher_usage_id_seq', 1, true);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_branding company_branding_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_branding
    ADD CONSTRAINT company_branding_pkey PRIMARY KEY (id);


--
-- Name: company_users company_users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_pkey PRIMARY KEY (id);


--
-- Name: compliance_items compliance_items_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.compliance_items
    ADD CONSTRAINT compliance_items_pkey PRIMARY KEY (id);


--
-- Name: cscs_cards cscs_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cscs_cards
    ADD CONSTRAINT cscs_cards_pkey PRIMARY KEY (id);


--
-- Name: document_annotations document_annotations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_annotations
    ADD CONSTRAINT document_annotations_pkey PRIMARY KEY (id);


--
-- Name: document_assessments document_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_assessments
    ADD CONSTRAINT document_assessments_pkey PRIMARY KEY (id);


--
-- Name: document_generation_requests document_generation_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_generation_requests
    ADD CONSTRAINT document_generation_requests_pkey PRIMARY KEY (id);


--
-- Name: document_reviews document_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_reviews
    ADD CONSTRAINT document_reviews_pkey PRIMARY KEY (id);


--
-- Name: document_templates document_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_templates
    ADD CONSTRAINT document_templates_pkey PRIMARY KEY (id);


--
-- Name: document_workflow document_workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_workflow
    ADD CONSTRAINT document_workflow_pkey PRIMARY KEY (id);


--
-- Name: email_notifications email_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_pkey PRIMARY KEY (id);


--
-- Name: generated_documents generated_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_pkey PRIMARY KEY (id);


--
-- Name: method_statements method_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.method_statements
    ADD CONSTRAINT method_statements_pkey PRIMARY KEY (id);


--
-- Name: risk_assessments risk_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: toolbox_talks toolbox_talks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.toolbox_talks
    ADD CONSTRAINT toolbox_talks_pkey PRIMARY KEY (id);


--
-- Name: two_factor_codes two_factor_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.two_factor_codes
    ADD CONSTRAINT two_factor_codes_pkey PRIMARY KEY (id);


--
-- Name: upload_sessions upload_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions
    ADD CONSTRAINT upload_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: voucher_codes voucher_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voucher_codes
    ADD CONSTRAINT voucher_codes_code_unique UNIQUE (code);


--
-- Name: voucher_codes voucher_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voucher_codes
    ADD CONSTRAINT voucher_codes_pkey PRIMARY KEY (id);


--
-- Name: voucher_usage voucher_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT voucher_usage_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: companies companies_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: company_branding company_branding_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_branding
    ADD CONSTRAINT company_branding_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_users company_users_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_users company_users_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.company_users
    ADD CONSTRAINT company_users_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: compliance_items compliance_items_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.compliance_items
    ADD CONSTRAINT compliance_items_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: compliance_items compliance_items_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.compliance_items
    ADD CONSTRAINT compliance_items_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: cscs_cards cscs_cards_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cscs_cards
    ADD CONSTRAINT cscs_cards_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: cscs_cards cscs_cards_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cscs_cards
    ADD CONSTRAINT cscs_cards_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: document_annotations document_annotations_document_id_generated_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_annotations
    ADD CONSTRAINT document_annotations_document_id_generated_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.generated_documents(id) ON DELETE CASCADE;


--
-- Name: document_annotations document_annotations_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_annotations
    ADD CONSTRAINT document_annotations_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: document_assessments document_assessments_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_assessments
    ADD CONSTRAINT document_assessments_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: document_assessments document_assessments_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_assessments
    ADD CONSTRAINT document_assessments_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: document_generation_requests document_generation_requests_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_generation_requests
    ADD CONSTRAINT document_generation_requests_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: document_generation_requests document_generation_requests_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_generation_requests
    ADD CONSTRAINT document_generation_requests_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: document_reviews document_reviews_document_id_generated_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_reviews
    ADD CONSTRAINT document_reviews_document_id_generated_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.generated_documents(id) ON DELETE CASCADE;


--
-- Name: document_reviews document_reviews_reviewer_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_reviews
    ADD CONSTRAINT document_reviews_reviewer_id_users_id_fk FOREIGN KEY (reviewer_id) REFERENCES public.users(id);


--
-- Name: document_workflow document_workflow_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_workflow
    ADD CONSTRAINT document_workflow_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: document_workflow document_workflow_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_workflow
    ADD CONSTRAINT document_workflow_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: document_workflow document_workflow_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_workflow
    ADD CONSTRAINT document_workflow_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: document_workflow document_workflow_document_id_generated_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_workflow
    ADD CONSTRAINT document_workflow_document_id_generated_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.generated_documents(id) ON DELETE CASCADE;


--
-- Name: email_notifications email_notifications_document_id_generated_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_document_id_generated_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.generated_documents(id);


--
-- Name: email_notifications email_notifications_recipient_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_recipient_id_users_id_fk FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: email_notifications email_notifications_workflow_id_document_workflow_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_notifications
    ADD CONSTRAINT email_notifications_workflow_id_document_workflow_id_fk FOREIGN KEY (workflow_id) REFERENCES public.document_workflow(id);


--
-- Name: generated_documents generated_documents_approved_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_approved_by_users_id_fk FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: generated_documents generated_documents_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: generated_documents generated_documents_generated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_generated_by_users_id_fk FOREIGN KEY (generated_by) REFERENCES public.users(id);


--
-- Name: generated_documents generated_documents_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: generated_documents generated_documents_template_id_document_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.generated_documents
    ADD CONSTRAINT generated_documents_template_id_document_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.document_templates(id);


--
-- Name: method_statements method_statements_authorized_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.method_statements
    ADD CONSTRAINT method_statements_authorized_by_users_id_fk FOREIGN KEY (authorized_by) REFERENCES public.users(id);


--
-- Name: method_statements method_statements_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.method_statements
    ADD CONSTRAINT method_statements_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: method_statements method_statements_risk_assessment_id_risk_assessments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.method_statements
    ADD CONSTRAINT method_statements_risk_assessment_id_risk_assessments_id_fk FOREIGN KEY (risk_assessment_id) REFERENCES public.risk_assessments(id);


--
-- Name: risk_assessments risk_assessments_assessor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_assessor_id_users_id_fk FOREIGN KEY (assessor_id) REFERENCES public.users(id);


--
-- Name: risk_assessments risk_assessments_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.risk_assessments
    ADD CONSTRAINT risk_assessments_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: toolbox_talks toolbox_talks_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.toolbox_talks
    ADD CONSTRAINT toolbox_talks_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: toolbox_talks toolbox_talks_conducted_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.toolbox_talks
    ADD CONSTRAINT toolbox_talks_conducted_by_users_id_fk FOREIGN KEY (conducted_by) REFERENCES public.users(id);


--
-- Name: two_factor_codes two_factor_codes_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.two_factor_codes
    ADD CONSTRAINT two_factor_codes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: upload_sessions upload_sessions_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions
    ADD CONSTRAINT upload_sessions_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: upload_sessions upload_sessions_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions
    ADD CONSTRAINT upload_sessions_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: voucher_usage voucher_usage_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT voucher_usage_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: voucher_usage voucher_usage_voucher_id_voucher_codes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.voucher_usage
    ADD CONSTRAINT voucher_usage_voucher_id_voucher_codes_id_fk FOREIGN KEY (voucher_id) REFERENCES public.voucher_codes(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

