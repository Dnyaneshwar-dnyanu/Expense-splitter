import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Suppress headers/footers on cover page (Page 1)
        if self._pageNumber > 1:
            # Header
            self.drawString(54, 750, "EXPENSE SPLITTER — COMPLETE INTERVIEW PREPARATION GUIDE")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
            # Footer
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 36, page_text)
            self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — PREPARED FOR TECHNICAL INTERVIEWS")
            self.line(54, 48, 558, 48)
            
        self.restoreState()

def build_pdf(filename="Expense_Splitter_Interview_Prep.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#0F172A")    # Dark Slate
    SECONDARY = colors.HexColor("#0284C7")  # Sky Blue
    ACCENT = colors.HexColor("#059669")     # Emerald Green
    TEXT_DARK = colors.HexColor("#1E293B")  # Charcoal
    BG_LIGHT = colors.HexColor("#F8FAFC")   # Slate 50
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Typography Styles
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=8
    )
    
    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=SECONDARY,
        spaceAfter=20
    )

    style_h1 = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=PRIMARY,
        spaceBefore=18,
        spaceAfter=10,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=8
    )

    style_body_bold = ParagraphStyle(
        'BodyBoldCustom',
        parent=style_body,
        fontName='Helvetica-Bold'
    )

    style_code = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0F172A"),
        backColor=BG_LIGHT,
        borderColor=BORDER_COLOR,
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=8,
        spaceBefore=4
    )

    style_callout = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0369A1"),
        backColor=colors.HexColor("#F0F9FF"),
        borderColor=colors.HexColor("#BAE6FD"),
        borderWidth=0.5,
        borderPadding=8,
        spaceAfter=10,
        spaceBefore=6
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=TEXT_DARK
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    story = []

    # ---------------------------------------------------------
    # COVER / HEADER BANNER
    # ---------------------------------------------------------
    story.append(Spacer(1, 10))
    story.append(Paragraph("Expense Splitter — Full-Stack Technical Deep Dive", style_cover_title))
    story.append(Paragraph("Complete Comprehensive Architecture, System Design & Interview Preparation Master Guide", style_cover_subtitle))
    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceBefore=0, spaceAfter=15))

    # Meta Quick Info Box
    meta_data = [
        [Paragraph("<b>Role / Context:</b> Full-Stack Developer Interview", style_table_cell),
         Paragraph("<b>Tech Stack:</b> MERN (MongoDB, Express v5, React 19, Node v22)", style_table_cell)],
        [Paragraph("<b>Auth Model:</b> JWT in HTTP-Only SameSite Cookies", style_table_cell),
         Paragraph("<b>Deployment:</b> Monorepo Architecture (Vite + Node)", style_table_cell)]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # ---------------------------------------------------------
    # SECTION 1: WHAT THE PROJECT IS
    # ---------------------------------------------------------
    story.append(Paragraph("1. What the Project Is", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))
    
    p1 = ("<b>Expense Splitter</b> (repository name <i>Expense-Tracker</i>, client app <i>tour_expense</i>) is a production-grade, "
          "full-stack web application engineered to solve the complex financial coordination problems that arise when groups of people "
          "share expenses during trips, events, or shared living arrangements.")
    story.append(Paragraph(p1, style_body))

    story.append(Paragraph("Core Problem Solved:", style_h2))
    p2 = ("When groups travel or live together, different members pay out-of-pocket for various shared costs (hotels, meals, gas, entertainment). "
          "Manually calculating individual shares, managing unequal splits, tracking who owes whom, and settling up leads to mathematical errors, "
          "awkward financial disputes, and friction. Expense Splitter automates group financial ledgers, supports custom unequal splitting, "
          "provides pairwise debt generation, and delivers an admin-managed settlement workflow.")
    story.append(Paragraph(p2, style_body))

    story.append(Paragraph("Real-World Use Case Scenario:", style_h2))
    p3 = ("Imagine 4 friends (Alice, Bob, Charlie, and David) go on a 3-day road trip:<br/>"
          "• <b>Hotel:</b> Alice pays ₹12,000 for all 4 people (Equal split = ₹3,000 each).<br/>"
          "• <b>Dinner:</b> Bob pays ₹3,000, but David only had drinks (Unequal custom split: Alice ₹1,000, Bob ₹1,000, Charlie ₹800, David ₹200).<br/>"
          "• <b>Gas:</b> Charlie pays ₹2,000 for Alice, Bob, and Charlie only.<br/>"
          "Without an app, calculating net balances requires complex pairwise balance reconciliations. With Expense Splitter, each member views "
          "their exact live ledger (<b>You Owe</b> vs <b>You Get</b> vs <b>Net Balance</b>), and the group admin can mark debts as settled in one click.")
    story.append(Paragraph(p3, style_body))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 2: ARCHITECTURE & SYSTEM FLOW
    # ---------------------------------------------------------
    story.append(Paragraph("2. Architecture & System Flow", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("System Architecture Overview:", style_h2))
    p_arch = ("The system follows a classic decoupled 3-Tier Monorepo Architecture: Single-Page Application (SPA) Client, "
              "RESTful API Server, and Document Database.")
    story.append(Paragraph(p_arch, style_body))

    # Diagram Table
    diag_data = [
        [Paragraph("<b>Client Tier (Frontend)</b>", style_table_header),
         Paragraph("<b>Server Tier (Backend API)</b>", style_table_header),
         Paragraph("<b>Database Tier</b>", style_table_header)],
        [Paragraph("React 19 + Vite<br/>Tailwind CSS v4<br/>Framer Motion<br/>React Router v7<br/>React Toastify", style_table_cell),
         Paragraph("Node.js v22 + Express v5<br/>JWT Cookie Auth<br/>Bcrypt Password Hashing<br/>Cors with Credentials<br/>Mongoose ODM v9", style_table_cell),
         Paragraph("MongoDB Atlas / Local<br/>Collections:<br/>• <i>users</i><br/>• <i>groups</i><br/>• <i>expenses</i>", style_table_cell)]
    ]
    diag_table = Table(diag_data, colWidths=[168, 168, 168])
    diag_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BACKGROUND', (0,1), (-1,1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(diag_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Authentication & Data Request Lifecycle:", style_h2))
    p_flow = ("1. <b>Client Request:</b> React frontend makes HTTP requests using standard <code>fetch()</code> with <code>credentials: 'include'</code>.<br/>"
              "2. <b>CORS & Middleware Interception:</b> Express backend runs CORS check against <code>FRONTEND_URL</code>, parses cookies via <code>cookie-parser</code>.<br/>"
              "3. <b>Token Validation (<code>validateUser</code>):</b> Middleware extracts JWT token from <code>req.cookies.token</code>, verifies signature with <code>JWT_KEY</code>, "
              "fetches User document (excluding password), and attaches object to <code>req.user</code>.<br/>"
              "4. <b>Business Logic Execution:</b> Route controller computes business logic (e.g., split amounts, invoice ledger, arrayFilter updates).<br/>"
              "5. <b>Database Persistence:</b> Mongoose executes MongoDB queries with population or atomic array updates.<br/>"
              "6. <b>Client State Hydration:</b> React receives JSON response and updates state via Framer Motion reactive UI.")
    story.append(Paragraph(p_flow, style_body))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 3: IMPORTANT COMPONENTS & FILE BREAKDOWN
    # ---------------------------------------------------------
    story.append(Paragraph("3. Important Components & File Breakdown", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    comp_data = [
        [Paragraph("<b>File Path & Module</b>", style_table_header),
         Paragraph("<b>Role & Purpose</b>", style_table_header),
         Paragraph("<b>Key Technology / Concepts Used</b>", style_table_header)],

        [Paragraph("<code>backend/server.js</code>", style_table_cell),
         Paragraph("Application entry point; mounts routes, configures CORS with credentials, express.json, and cookie-parser.", style_table_cell),
         Paragraph("Express v5, CORS whitelist, cookie-parser", style_table_cell)],

        [Paragraph("<code>backend/config/db.js</code>", style_table_cell),
         Paragraph("Establishes async connection to MongoDB database via Mongoose.", style_table_cell),
         Paragraph("Mongoose v9, process.env.MONGO_URL", style_table_cell)],

        [Paragraph("<code>backend/models/User.js</code>", style_table_cell),
         Paragraph("User schema defining profile attributes, unique lowercase username, email, and array of Group ObjectIds.", style_table_cell),
         Paragraph("Mongoose Schema, ObjectId refs to 'Group'", style_table_cell)],

        [Paragraph("<code>backend/models/Group.js</code>", style_table_cell),
         Paragraph("Group schema containing groupName, description, admin ref, members refs, expenses refs, and totalGroupExpense.", style_table_cell),
         Paragraph("ObjectId refs to 'User' and 'Expense'", style_table_cell)],

        [Paragraph("<code>backend/models/Expense.js</code>", style_table_cell),
         Paragraph("Expense schema storing spentFor, totalExpense, paidBy, splitType, groupID, and participants array with sharedAmount & isSettled.", style_table_cell),
         Paragraph("Sub-document arrays, Boolean settlement flags", style_table_cell)],

        [Paragraph("<code>backend/middleware/validateUser.js</code>", style_table_cell),
         Paragraph("JWT Authentication guard. Extracts token from HttpOnly cookie, verifies JWT, attaches req.user.", style_table_cell),
         Paragraph("jsonwebtoken (jwt.verify), HTTP Cookies", style_table_cell)],

        [Paragraph("<code>backend/controllers/authController.js</code>", style_table_cell),
         Paragraph("Handles registration (username auto-generation, bcrypt hashing), login (token generation, cookie setting), and logout.", style_table_cell),
         Paragraph("bcrypt (salt 10), res.cookie(httpOnly, sameSite)", style_table_cell)],

        [Paragraph("<code>backend/routes/authRoutes.js</code>", style_table_cell),
         Paragraph("Auth routing + profile fetch/update endpoints and regex-based user search API.", style_table_cell),
         Paragraph("MongoDB $regex search, $options: 'i', $ne filter", style_table_cell)],

        [Paragraph("<code>backend/routes/groupsRoutes.js</code>", style_table_cell),
         Paragraph("Group endpoints: group creation (linked to members), group deletion (cascading delete), group fetch with multi-level population.", style_table_cell),
         Paragraph("Promise.all, Mongoose populate, $pull", style_table_cell)],

        [Paragraph("<code>backend/routes/expenseRoutes.js</code>", style_table_cell),
         Paragraph("Core financial engine: add expense (equal/custom split), getInvoice (debt ledger), settle (arrayFilters), edit/delete/bulkDelete.", style_table_cell),
         Paragraph("MongoDB arrayFilters ($[elem]), deleteMany", style_table_cell)],

        [Paragraph("<code>frontend/src/App.jsx</code>", style_table_cell),
         Paragraph("Frontend Router configuration with dynamic parameter routes and ProtectedRoute wrappers.", style_table_cell),
         Paragraph("React Router v7 (BrowserRouter, Routes, Route)", style_table_cell)],

        [Paragraph("<code>src/components/common/ProtectedRoute.jsx</code>", style_table_cell),
         Paragraph("Higher-Order Component guarding routes by pinging /validateUser before rendering children.", style_table_cell),
         Paragraph("React useEffect, useState, Navigate", style_table_cell)],

        [Paragraph("<code>src/pages/GroupDetails.jsx</code>", style_table_cell),
         Paragraph("Primary workspace managing tabs (Summary, Add Expense, History, Settlement) and member sidebar.", style_table_cell),
         Paragraph("Framer Motion AnimatePresence, tab state", style_table_cell)],

        [Paragraph("<code>src/components/expenses/AddExpense.jsx</code>", style_table_cell),
         Paragraph("Dual-mode form supporting Equal split calculation and Custom manual per-participant amounts.", style_table_cell),
         Paragraph("Dynamic controlled inputs, custom validation", style_table_cell)],

        [Paragraph("<code>src/components/settlements/Invoice.jsx</code>", style_table_cell),
         Paragraph("Summary dashboard displaying 'You Owe', 'You Get', 'Net Balance' and detailed Giving/Getting lists.", style_table_cell),
         Paragraph("Object.entries, array reductions", style_table_cell)],

        [Paragraph("<code>src/components/settlements/FinalSettlement.jsx</code>", style_table_cell),
         Paragraph("Calculates net pairwise balances between members and renders admin 'Settle Up' action trigger.", style_table_cell),
         Paragraph("Conditional balance evaluation, Admin guard", style_table_cell)]
    ]

    comp_table = Table(comp_data, colWidths=[130, 244, 130])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 4: END-TO-END WORKING (STEP-BY-STEP)
    # ---------------------------------------------------------
    story.append(Paragraph("4. End-to-End Working (Step-by-Step)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("Flow 1: User Registration & Authentication Setup", style_h2))
    p_e2e_1 = ("1. User submits form on <code>/Register</code> with name, username, email, and password.<br/>"
               "2. Request arrives at <code>POST /api/auth/register</code>.<br/>"
               "3. Backend checks if email or username already exists in <code>User</code> collection. If username is missing, it auto-generates one from the email prefix.<br/>"
               "4. Password is hashed using <code>bcrypt.hash(password, 10)</code>.<br/>"
               "5. User document is saved. JWT token is signed with payload <code>{ email, _id }</code>.<br/>"
               "6. Token is set in response cookie: <code>httpOnly: true</code>, <code>sameSite: 'lax'/'none'</code>, <code>maxAge: 7 days</code>.<br/>"
               "7. User is redirected to Dashboard.")
    story.append(Paragraph(p_e2e_1, style_body))

    story.append(Paragraph("Flow 2: Group Creation & Bi-directional Referencing", style_h2))
    p_e2e_2 = ("1. User navigates to <code>CreateGroup</code> page, enters Group Name, Description, and searches members via <code>UserSearch</code>.<br/>"
               "2. Submit pings <code>POST /user/group/:userID/create_group</code>.<br/>"
               "3. Server maps member ObjectIds, prepends the creator's ID as <code>admin</code>.<br/>"
               "4. <code>Group</code> document is created.<br/>"
               "5. Server runs <code>Promise.all()</code> across all member IDs, updating each user's document by pushing the new <code>createdGroup._id</code> into <code>user.groups</code> array.")
    story.append(Paragraph(p_e2e_2, style_body))

    story.append(Paragraph("Flow 3: Expense Logging & Division Math", style_h2))
    p_e2e_3 = ("1. In <code>GroupDetails</code>, user submits 'Add Expense' form (e.g. Total ₹3,000, Paid by Alice, Participants: Alice, Bob, Charlie).<br/>"
               "2. If <code>splitType === 'equal'</code>: Backend computes <code>sharedAmount = totalExpense / participants.length</code> (₹1,000 each).<br/>"
               "3. If <code>splitType === 'custom'</code>: Backend reads <code>customAmounts[userID]</code> for each participant.<br/>"
               "4. Expense document is created in MongoDB.<br/>"
               "5. Server updates Group document: <code>group.totalGroupExpense += totalExpense</code> and <code>group.expenses.push(expense._id)</code>.<br/>"
               "6. <i>Error Rollback:</i> If updating the group fails, a manual rollback executes: <code>await expenseModel.findByIdAndDelete(expense._id)</code>.")
    story.append(Paragraph(p_e2e_3, style_body))

    story.append(Paragraph("Flow 4: Invoice Ledger & Admin Settlement", style_h2))
    p_e2e_4 = ("1. Component pings <code>GET /user/expense/:userID/:groupID/getInvoice</code>.<br/>"
               "2. Server finds expenses where logged-in user is either <code>paidBy</code> OR in <code>participants</code>.<br/>"
               "3. Server iterates expenses, skipping settled items (<code>!isSettled</code>):<br/>"
               "   • If User paid: accumulates non-settled participant shares into <code>getExpenses</code>.<br/>"
               "   • If User participated & didn't pay: accumulates share owed to payer into <code>giveExpenses</code>.<br/>"
               "4. <b>Admin Settle Up:</b> Admin clicks 'Settle Up' for Member X -> pings <code>POST /user/expense/:groupID/settle/:withUserID</code>.<br/>"
               "5. Server uses MongoDB <code>updateMany</code> with <code>arrayFilters</code> to mark matching participant sub-documents as <code>isSettled: true</code>.")
    story.append(Paragraph(p_e2e_4, style_body))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 5: DATABASE SCHEMAS & API REFERENCE
    # ---------------------------------------------------------
    story.append(Paragraph("5. Database Schemas & API Reference", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("MongoDB Models & Relationships:", style_h2))
    
    # Code snippet for models
    code_models = """// User Schema
{ name: String, username: { type: String, unique: true }, email: String, password: String, groups: [{ type: ObjectId, ref: 'Group' }] }

// Group Schema
{ groupName: String, description: String, admin: { type: ObjectId, ref: 'User' }, members: [{ type: ObjectId, ref: 'User' }], expenses: [{ type: ObjectId, ref: 'Expense' }], totalGroupExpense: Number }

// Expense Schema
{ spentFor: String, totalExpense: Number, paidBy: { type: ObjectId, ref: 'User' }, splitType: String, groupID: { type: ObjectId, ref: 'Group' }, participants: [{ userID: { type: ObjectId, ref: 'User' }, sharedAmount: Number, isSettled: { type: Boolean, default: false } }] }"""
    story.append(Paragraph(code_models, style_code))

    story.append(Paragraph("Complete REST API Reference Matrix:", style_h2))
    api_data = [
        [Paragraph("<b>HTTP Method & Endpoint</b>", style_table_header),
         Paragraph("<b>Auth</b>", style_table_header),
         Paragraph("<b>Description & Operation</b>", style_table_header),
         Paragraph("<b>Key Request / Response Payload</b>", style_table_header)],

        [Paragraph("<code>POST /api/auth/register</code>", style_table_cell),
         Paragraph("No", style_table_cell),
         Paragraph("Registers user, hashes password, generates JWT cookie.", style_table_cell),
         Paragraph("Req: { name, username, email, password }<br/>Res: { auth: true, user }", style_table_cell)],

        [Paragraph("<code>POST /api/auth/login</code>", style_table_cell),
         Paragraph("No", style_table_cell),
         Paragraph("Authenticates user credentials, sets HttpOnly JWT cookie.", style_table_cell),
         Paragraph("Req: { email, password }<br/>Res: { auth: true, user }", style_table_cell)],

        [Paragraph("<code>GET /api/auth/validateUser</code>", style_table_cell),
         Paragraph("Yes", style_table_cell),
         Paragraph("Validates JWT token for ProtectedRoute verification.", style_table_cell),
         Paragraph("Res: { success: true } or 401 Auth False", style_table_cell)],

        [Paragraph("<code>GET /api/auth/getUser</code>", style_table_cell),
         Paragraph("Yes", style_table_cell),
         Paragraph("Fetches logged-in user profile populated with groups.", style_table_cell),
         Paragraph("Res: { success: true, user } (password omitted)", style_table_cell)],

        [Paragraph("<code>GET /api/auth/searchUsers</code>", style_table_cell),
         Paragraph("Yes", style_table_cell),
         Paragraph("Regex search for users by name/email/username excluding current user.", style_table_cell),
         Paragraph("Query: ?q=john<br/>Res: { success: true, users: [] }", style_table_cell)],

        [Paragraph("<code>POST /user/group/:userID/create_group</code>", style_table_cell),
         Paragraph("Yes", style_table_cell),
         Paragraph("Creates group, assigns admin, updates all member user models.", style_table_cell),
         Paragraph("Req: { groupName, description, members: [] }", style_table_cell)],

        [Paragraph("<code>GET /user/group/:groupID/getGroup</code>", style_table_cell),
         Paragraph("Public/User", style_table_cell),
         Paragraph("Fetches group populated with members, admin, and expenses.", style_table_cell),
         Paragraph("Res: { success: true, group: { ... } }", style_table_cell)],

        [Paragraph("<code>DELETE /user/group/:groupID/deleteGroup</code>", style_table_cell),
         Paragraph("Yes (Admin)", style_table_cell),
         Paragraph("Deletes group, pulls ref from users, deletes group expenses.", style_table_cell),
         Paragraph("Res: { success: true, message }", style_table_cell)],

        [Paragraph("<code>POST /user/expense/:groupID/addExpense</code>", style_table_cell),
         Paragraph("Yes", style_table_cell),
         Paragraph("Calculates equal/custom split, creates expense, updates group total.", style_table_cell),
         Paragraph("Req: { spentFor, paidBy, totalExpense, splitType, participants, customAmounts }", style_table_cell)],

        [Paragraph("<code>GET /user/expense/:userID/:groupID/getInvoice</code>", style_table_cell),
         Paragraph("Public/User", style_table_cell),
         Paragraph("Computes non-settled giving/getting ledger for user.", style_table_cell),
         Paragraph("Res: { getExpenses: {}, giveExpenses: {} }", style_table_cell)],

        [Paragraph("<code>POST /user/expense/:groupID/settle/:withUserID</code>", style_table_cell),
         Paragraph("Yes (Admin)", style_table_cell),
         Paragraph("Executes atomic MongoDB arrayFilters update marking debts settled.", style_table_cell),
         Paragraph("Res: { success: true, message: 'Settled up successfully!' }", style_table_cell)],

        [Paragraph("<code>POST /user/expense/bulkDelete</code>", style_table_cell),
         Paragraph("Yes (Admin)", style_table_cell),
         Paragraph("Deletes array of selected expenses and updates group totals.", style_table_cell),
         Paragraph("Req: { expenseIDs: [...] }", style_table_cell)]
    ]

    api_table = Table(api_data, colWidths=[120, 45, 175, 164])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 6: KEY TECHNICAL CONCEPTS
    # ---------------------------------------------------------
    story.append(Paragraph("6. Key Technical Concepts (Interview Friendly)", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("1. JWT Authentication in HttpOnly Cookies vs LocalStorage", style_h2))
    story.append(Paragraph("<b>Simple Concept:</b> LocalStorage is readable by JavaScript, making tokens vulnerable to Cross-Site Scripting (XSS) attacks. "
                           "By setting JWTs in <code>HttpOnly</code> cookies, the browser automatically attaches the cookie to requests, but client-side JavaScript cannot access it via <code>document.cookie</code>.", style_body))

    story.append(Paragraph("2. Mongoose Schema Population (<code>.populate()</code>)", style_h2))
    story.append(Paragraph("<b>Simple Concept:</b> MongoDB is a non-relational document database without native SQL JOINs. Mongoose <code>.populate()</code> "
                           "simulates JOIN behavior at the application layer by reading stored ObjectIds and automatically firing a second query to hydrate referenced documents.", style_body))

    story.append(Paragraph("3. MongoDB Positional Operators & Array Filters (<code>$[elem]</code>)", style_h2))
    story.append(Paragraph("<b>Simple Concept:</b> When updating an object buried inside an array in MongoDB (e.g. setting <code>isSettled: true</code> "
                           "for a specific participant in an expense), <code>arrayFilters</code> allows precise targeting of elements matching a filter condition without rewriting the entire array.", style_body))
    
    code_filter = """// MongoDB arrayFilter snippet from expenseRoutes.js
await expenseModel.updateMany(
    { groupID, paidBy: userID, "participants.userID": withUserID },
    { $set: { "participants.$[elem].isSettled": true } },
    { arrayFilters: [{ "elem.userID": withUserID }] }
);"""
    story.append(Paragraph(code_filter, style_code))

    story.append(Paragraph("4. Bi-directional Schema Referencing", style_h2))
    story.append(Paragraph("<b>Simple Concept:</b> In our database, <code>Group</code> stores an array of member <code>User</code> IDs, and <code>User</code> stores an array of <code>Group</code> IDs. "
                           "This dual-linking provides O(1) direct query access from both directions at the cost of keeping references synchronized.", style_body))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 7: DESIGN DECISIONS & TRADE-OFFS
    # ---------------------------------------------------------
    story.append(Paragraph("7. Design Decisions & Architectural Trade-offs", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    dd_data = [
        [Paragraph("<b>Design Decision</b>", style_table_header),
         Paragraph("<b>Chosen Approach</b>", style_table_header),
         Paragraph("<b>Alternative Approach</b>", style_table_header),
         Paragraph("<b>Trade-off Rationale & Evaluation</b>", style_table_header)],

        [Paragraph("Token Storage", style_table_cell),
         Paragraph("HttpOnly, SameSite Cookie", style_table_cell),
         Paragraph("LocalStorage / SessionStorage", style_table_cell),
         Paragraph("HttpOnly cookies block XSS token theft. Requires CORS <code>credentials: true</code> configuration.", style_table_cell)],

        [Paragraph("Relational Fetching", style_table_cell),
         Paragraph("Mongoose <code>.populate()</code>", style_table_cell),
         Paragraph("MongoDB <code>$lookup</code> Aggregation", style_table_cell),
         Paragraph("Population is cleaner in JavaScript code. Aggregation pipeline is significantly faster for large datasets.", style_table_cell)],

        [Paragraph("Debt Ledger Model", style_table_cell),
         Paragraph("Pairwise Ledger Generation", style_table_cell),
         Paragraph("Greedy Min-Cash-Flow Graph Reduction", style_table_cell),
         Paragraph("Pairwise keeps transparent expense line-items per person. Graph reduction minimizes total transactions (e.g. 3-way split).", style_table_cell)],

        [Paragraph("Multi-Doc Updates", style_table_cell),
         Paragraph("Manual try-catch rollback", style_table_cell),
         Paragraph("MongoDB ACID Transactions (Sessions)", style_table_cell),
         Paragraph("Manual rollback works on standalone MongoDB. ACID transactions require MongoDB Replica Sets.", style_table_cell)]
    ]

    dd_table = Table(dd_data, colWidths=[90, 110, 110, 194])
    dd_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(dd_table)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 8: SECURITY, SCALABILITY & ERROR HANDLING
    # ---------------------------------------------------------
    story.append(Paragraph("8. Security, Scalability & Error Handling", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("Security Mechanisms Implemented:", style_h2))
    p_sec = ("• <b>Password Security:</b> Passwords hashed via <code>bcrypt</code> with 10 salt rounds before database insertion.<br/>"
             "• <b>Token Protection:</b> JWT stored in <code>HttpOnly</code> cookies prevents client JavaScript access.<br/>"
             "• <b>Route Guards:</b> <code>validateUser</code> middleware protects routes and sets <code>req.user</code>.<br/>"
             "• <b>Admin Authorization:</b> Group deletion, member addition, expense edits, and settlement restricted to <code>group.admin</code>.")
    story.append(Paragraph(p_sec, style_body))

    story.append(Paragraph("Potential Security Gaps & Missing Features (Honest Interview Points):", style_h2))
    p_sec_gaps = ("• <b>No Rate Limiting:</b> Endpoints like <code>/login</code> and <code>/register</code> lack <code>express-rate-limit</code>, exposing them to brute-force attacks.<br/>"
                  "• <b>Input Schema Validation:</b> Lacks validation libraries like <code>Zod</code> or <code>Joi</code> to validate body payload types.<br/>"
                  "• <b>CSRF Vulnerability:</b> When using <code>sameSite: 'none'</code> across domains, explicit CSRF token verification (e.g. Double Submit Cookie) should be added.")
    story.append(Paragraph(p_sec_gaps, style_body))

    story.append(Paragraph("Scalability Bottlenecks & Optimization Strategies:", style_h2))
    p_scale = ("1. <b>Unindexed MongoDB Queries:</b> Fields like <code>groupID</code> and <code>paidBy</code> in <code>Expense</code> need database compound indexes (<code>{ groupID: 1, paidBy: 1 }</code>).<br/>"
               "2. <b>Unbounded Array Growth:</b> Storing all expense ObjectIds inside <code>Group.expenses</code> can exceed MongoDB's 16MB document limit if a group has thousands of expenses. Fix: Query expenses via <code>Expense.find({ groupID })</code> with pagination.<br/>"
               "3. <b>Floating-Point Rounding:</b> In JS, <code>100 / 3 = 33.333333333333336</code>. Division floating-point errors must be handled using integer cents (e.g., storing ₹100.00 as 10000 paise).")
    story.append(Paragraph(p_scale, style_body))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 9: INTERVIEW PREPARATION & QUESTIONS
    # ---------------------------------------------------------
    story.append(Paragraph("9. Interview Preparation & Question Bank", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    qa_list = [
        ("Q1: How does authentication work in your application?",
         "Answer: I implemented stateless authentication using JWT stored in HttpOnly SameSite cookies. When a user logs in, backend verifies password hash with bcrypt, signs a JWT containing email and user ID, and sends it back in an HttpOnly cookie. On subsequent requests, validateUser middleware extracts and verifies the cookie token before granting access."),

        ("Q2: Why did you store JWT in HttpOnly cookies instead of LocalStorage?",
         "Answer: Storing JWT in LocalStorage makes it accessible to any JavaScript code running on the page, rendering it vulnerable to XSS attacks. HttpOnly cookies cannot be accessed via document.cookie by client scripts, isolating the token from malicious scripts."),

        ("Q3: How do you handle unequal expense splitting?",
         "Answer: In the expense controller, I check splitType. If 'equal', it divides totalExpense by participant count. If 'custom', it reads customAmounts map sent from frontend, validates that every participant has an assigned share, and constructs participants array with individual sharedAmount properties."),

        ("Q4: How does the Settlement feature work under the hood?",
         "Answer: Settlement updates the isSettled boolean flag inside the expense participants array. The backend uses Mongoose updateMany with positional arrayFilters: {$set: {'participants.$[elem].isSettled': true}} where elem.userID matches the target member."),

        ("Q5: What happens if an error occurs while updating group expenses after creating an expense?",
         "Answer: I implemented a manual rollback pattern in try-catch block. If group update fails after expense creation, the backend catches the error, calls expenseModel.findByIdAndDelete(expense._id) to delete orphaned expense, and returns a 500 error."),

        ("Q6: How would you optimize performance if a group has 50,000 expenses?",
         "Answer: First, remove expenses array from Group document to avoid 16MB document limit. Second, add compound database index on Expense collection { groupID: 1, addedAt: -1 }. Third, implement pagination on history tab and convert Mongoose populate to MongoDB Aggregation pipeline."),

        ("Q7: How did you implement real-time user search when adding group members?",
         "Answer: On the frontend, UserSearch component captures input query and calls GET /api/auth/searchUsers?q=searchterm. Backend executes regex query userModel.find({ $or: [{username: regex}, {email: regex}, {name: regex}], _id: { $ne: req.user._id } }) limited to 10 results."),

        ("Q8: What is the optimal algorithm for settling group debts (Splitwise algorithm)?",
         "Answer: The Greedy Min-Cash-Flow graph algorithm. Instead of pair-by-pair payments, compute net balance for each person. Separate people into debtors and creditors, then iteratively match largest debtor with largest creditor. This reduces transaction count to at most N-1."),

        ("Q9: What cross-domain issues did you face between Vite frontend and Express backend?",
         "Answer: Setting credentials: true on frontend fetch requires backend CORS to specify explicit origin process.env.FRONTEND_URL (not wildcard '*'). Additionally, cookie requires sameSite: 'none' and secure: true in production HTTPS environments."),

        ("Q10: How would you scale this application for 100,000 active users?",
         "Answer: 1) Deploy stateless Express API across multiple auto-scaling containers behind a Load Balancer. 2) Implement Redis cache for active user profiles and group meta. 3) Upgrade MongoDB to a Sharded Cluster sharded by groupID.")
    ]

    for q, a in qa_list:
        story.append(Paragraph(f"<b>{q}</b>", style_h2))
        story.append(Paragraph(a, style_body))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 10: FINAL CHEAT SHEET & 1-MINUTE PITCH
    # ---------------------------------------------------------
    story.append(Paragraph("10. Final Cheat Sheet & 1-Minute Pitch", style_h1))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceBefore=0, spaceAfter=8))

    story.append(Paragraph("The 1-Minute Project Elevator Pitch (Memorize This!):", style_h2))
    pitch_box = ("\"Expense Splitter is a full-stack MERN application designed to automate group expense tracking and debt settlements, "
                 "similar to Splitwise. I built the backend with Node.js, Express, and MongoDB using Mongoose, and the frontend with React 19, "
                 "Tailwind CSS, and Framer Motion.<br/><br/>"
                 "Key features include dual-mode expense division (equal and custom unequal splits), dynamic search for group members, "
                 "and a real-time debt ledger that calculates 'You Owe', 'You Get', and 'Net Balance'. For security, I implemented JWT authentication "
                 "stored in HTTP-Only cookies with bcrypt password hashing. On the database side, I utilized MongoDB arrayFilters for atomic nested array updates "
                 "and bi-directional schema references. If I had more time, I would replace pairwise settlement with the Greedy Min-Cash-Flow graph algorithm and add MongoDB ACID transactions.\"")
    story.append(Paragraph(pitch_box, style_callout))

    story.append(Paragraph("Top 5 Golden Technical Takeaways:", style_h2))
    p_golden = ("1. <b>Auth:</b> JWT in <code>HttpOnly</code> cookies = XSS mitigation.<br/>"
                "2. <b>DB Updates:</b> MongoDB <code>arrayFilters</code> (<code>$[elem]</code>) = atomic nested array updates.<br/>"
                "3. <b>Splitting Engine:</b> Supports both equal division and custom participant maps.<br/>"
                "4. <b>CORS:</b> <code>credentials: 'include'</code> requires exact origin matching, not wildcard.<br/>"
                "5. <b>System Improvement:</b> Upgrade debt calculation from Pairwise to Greedy Min-Cash-Flow Graph Algorithm.")
    story.append(Paragraph(p_golden, style_body))

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF successfully generated at: {os.path.abspath(filename)}")

if __name__ == "__main__":
    build_pdf()
