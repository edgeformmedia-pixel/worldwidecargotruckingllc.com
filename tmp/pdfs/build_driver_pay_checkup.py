from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import os

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "output", "pdf", "driver-pay-checkup-lead-magnet.pdf"))

NAVY = HexColor("#0B1F33")
BLUE = HexColor("#1273DE")
RED = HexColor("#E63B2E")
SKY = HexColor("#EAF4FF")
ICE = HexColor("#F4F7FA")
INK = HexColor("#16212C")
GRAY = HexColor("#66717D")
LINE = HexColor("#D9E1E8")
GREEN = HexColor("#198754")
WHITE = colors.white

FONT_REG = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
for path, name in [
    (r"C:\Windows\Fonts\Aptos.ttf", "Aptos"),
    (r"C:\Windows\Fonts\Aptos-Bold.ttf", "Aptos-Bold"),
]:
    if os.path.exists(path):
        pdfmetrics.registerFont(TTFont(name, path))
if "Aptos" in pdfmetrics.getRegisteredFontNames():
    FONT_REG = "Aptos"
if "Aptos-Bold" in pdfmetrics.getRegisteredFontNames():
    FONT_BOLD = "Aptos-Bold"


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return
        self.saveState()
        self.setStrokeColor(LINE)
        self.line(0.65 * inch, 0.52 * inch, 7.85 * inch, 0.52 * inch)
        self.setFont(FONT_REG, 8)
        self.setFillColor(GRAY)
        self.drawString(0.65 * inch, 0.32 * inch, "WORLDWIDE CARGO EXPRESS LLC  |  DRIVER RESOURCE")
        self.drawRightString(7.85 * inch, 0.32 * inch, f"{self._pageNumber} / {page_count}")
        self.restoreState()


def cover_page(c, doc):
    w, h = letter
    c.saveState()
    c.setFillColor(NAVY)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.circle(w - 0.45 * inch, h - 0.25 * inch, 2.15 * inch, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(0, 0, 0.16 * inch, h, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont(FONT_BOLD, 11)
    c.drawString(0.7 * inch, h - 0.78 * inch, "WORLDWIDE CARGO EXPRESS LLC")
    c.setFont(FONT_BOLD, 30)
    c.drawString(0.7 * inch, h - 2.25 * inch, "THE DRIVER PAY")
    c.drawString(0.7 * inch, h - 2.68 * inch, "CHECKUP")
    c.setFillColor(HexColor("#A8D0FF"))
    c.setFont(FONT_BOLD, 16)
    c.drawString(0.72 * inch, h - 3.15 * inch, "Know what the offer is really worth.")
    c.setFillColor(WHITE)
    c.setFont(FONT_REG, 12)
    text = c.beginText(0.72 * inch, h - 3.72 * inch)
    text.setLeading(18)
    for line in [
        "A practical workbook for company drivers",
        "comparing pay, miles, home time and carrier fit.",
    ]:
        text.textLine(line)
    c.drawText(text)
    c.setFillColor(WHITE)
    c.roundRect(0.72 * inch, 1.55 * inch, 3.9 * inch, 1.1 * inch, 10, fill=0, stroke=1)
    c.setFont(FONT_BOLD, 11)
    c.drawString(0.95 * inch, 2.28 * inch, "INSIDE THIS FREE GUIDE")
    c.setFont(FONT_REG, 10)
    c.drawString(0.95 * inch, 1.96 * inch, "Pay worksheet  |  Offer comparison  |  Red flags")
    c.drawString(0.95 * inch, 1.70 * inch, "Carrier verification  |  Recruiter questions")
    c.setFillColor(HexColor("#A8B7C7"))
    c.setFont(FONT_REG, 8.5)
    c.drawString(0.72 * inch, 0.72 * inch, "Educational example. Earnings depend on actual miles, rate, deductions and availability.")
    c.restoreState()


def later_page(c, doc):
    c.saveState()
    c.setFillColor(WHITE)
    c.rect(0, 10.55 * inch, 8.5 * inch, 0.45 * inch, fill=1, stroke=0)
    c.setFillColor(RED)
    c.rect(0, 10.55 * inch, 0.16 * inch, 0.45 * inch, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.line(0.65 * inch, 0.52 * inch, 7.85 * inch, 0.52 * inch)
    c.setFont(FONT_REG, 8)
    c.setFillColor(GRAY)
    c.drawString(0.65 * inch, 0.32 * inch, "WORLDWIDE CARGO EXPRESS LLC  |  DRIVER RESOURCE")
    c.drawRightString(7.85 * inch, 0.32 * inch, f"PAGE {c.getPageNumber()}")
    c.restoreState()


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="Kicker", fontName=FONT_BOLD, fontSize=9, leading=11, textColor=BLUE, spaceAfter=7))
styles.add(ParagraphStyle(name="TitleX", fontName=FONT_BOLD, fontSize=25, leading=29, textColor=NAVY, spaceAfter=10))
styles.add(ParagraphStyle(name="Deck", fontName=FONT_REG, fontSize=11, leading=16, textColor=GRAY, spaceAfter=16))
styles.add(ParagraphStyle(name="H2X", fontName=FONT_BOLD, fontSize=15, leading=18, textColor=NAVY, spaceBefore=8, spaceAfter=7))
styles.add(ParagraphStyle(name="BodyX", fontName=FONT_REG, fontSize=9.5, leading=14, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle(name="SmallX", fontName=FONT_REG, fontSize=7.5, leading=10, textColor=GRAY))
styles.add(ParagraphStyle(name="Callout", fontName=FONT_BOLD, fontSize=10.5, leading=14, textColor=NAVY))
styles.add(ParagraphStyle(name="WhiteTitle", fontName=FONT_BOLD, fontSize=21, leading=25, textColor=WHITE, alignment=TA_CENTER))


def P(text, style="BodyX"):
    return Paragraph(text, styles[style])


def section_head(kicker, title, deck):
    return [P(kicker.upper(), "Kicker"), P(title, "TitleX"), P(deck, "Deck")]


def blank_line(width=1.0 * inch):
    return Table([[""]], colWidths=[width], rowHeights=[0.23 * inch], style=TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.8, LINE)
    ]))


story = [Spacer(1, 9.0 * inch), PageBreak(), Spacer(1, 0.34*inch)]

story += section_head("Step 1", "Run your 60-second pay checkup", "Use real numbers from recent settlements or pay statements. Promised miles are not the same as paid miles.")

pay_rows = [
    [P("INPUT", "SmallX"), P("YOUR NUMBER", "SmallX"), P("WHY IT MATTERS", "SmallX")],
    [P("Pay rate per mile", "BodyX"), blank_line(), P("Base rate before bonuses", "SmallX")],
    [P("Average paid miles / week", "BodyX"), blank_line(), P("Use a 4-week average", "SmallX")],
    [P("Average weekly bonuses", "BodyX"), blank_line(), P("Safety, performance, stop pay", "SmallX")],
    [P("Weekly deductions", "BodyX"), blank_line(), P("Insurance, equipment or other", "SmallX")],
    [P("Days away from home", "BodyX"), blank_line(), P("Count the true time cost", "SmallX")],
]
t = Table(pay_rows, colWidths=[2.25*inch, 1.8*inch, 2.65*inch], repeatRows=1)
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), WHITE),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("GRID", (0,0), (-1,-1), 0.5, LINE),
    ("BACKGROUND", (0,1), (-1,-1), WHITE), ("LEFTPADDING", (0,0), (-1,-1), 8),
    ("RIGHTPADDING", (0,0), (-1,-1), 8), ("TOPPADDING", (0,1), (-1,-1), 8), ("BOTTOMPADDING", (0,1), (-1,-1), 8),
]))
story += [t, Spacer(1, 14)]

formula = Table([[P("ESTIMATED WEEKLY GROSS", "Callout"), P("(rate x paid miles) + bonuses", "BodyX")],
                 [P("ESTIMATED TAKE-HOME", "Callout"), P("weekly gross - taxes - deductions", "BodyX")]],
                colWidths=[2.45*inch, 4.25*inch])
formula.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), SKY), ("BOX", (0,0), (-1,-1), 1, BLUE),
    ("INNERGRID", (0,0), (-1,-1), 0.5, HexColor("#B9D7F7")),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("LEFTPADDING", (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10), ("TOPPADDING", (0,0), (-1,-1), 9), ("BOTTOMPADDING", (0,0), (-1,-1), 9),
]))
story += [formula, Spacer(1, 14), P("Quick reality check", "H2X")]
checks = [
    "Are all dispatched miles paid, including empty miles?",
    "Are detention, layover, stops and breakdowns compensated?",
    "Is the weekly figure guaranteed or only an estimate?",
    "How often did current drivers actually reach the advertised miles?",
]
for item in checks:
    story.append(P(f"<font color='#1273DE'><b>[ ]</b></font>  {item}", "BodyX"))
story.append(PageBreak())

story.append(Spacer(1, 0.34*inch))
story += section_head("Step 2", "Compare the whole offer", "A higher CPM can lose to steadier miles, fewer unpaid days and better home time. Score both offers using the same evidence.")
compare = [
    [P("COMPARISON", "SmallX"), P("OFFER A", "SmallX"), P("OFFER B", "SmallX")],
    ["Advertised CPM", "", ""], ["Real paid miles / week", "", ""], ["Guaranteed minimum", "", ""],
    ["Detention / layover / stop pay", "", ""], ["Typical home time", "", ""], ["Truck age / maintenance", "", ""],
    ["Benefits start date", "", ""], ["Deductions", "", ""], ["Sign-on bonus conditions", "", ""],
    ["Estimated weekly gross", "", ""], ["My fit score (1-10)", "", ""],
]
t2 = Table(compare, colWidths=[3.1*inch, 1.8*inch, 1.8*inch], rowHeights=[0.30*inch] + [0.32*inch]*11, repeatRows=1)
t2.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), WHITE),
    ("FONTNAME", (0,1), (0,-1), FONT_BOLD), ("FONTNAME", (1,1), (-1,-1), FONT_REG),
    ("FONTSIZE", (0,1), (-1,-1), 8.5), ("TEXTCOLOR", (0,1), (-1,-1), INK),
    ("GRID", (0,0), (-1,-1), 0.55, LINE), ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ("BACKGROUND", (0,1), (0,-1), ICE), ("LEFTPADDING", (0,0), (-1,-1), 8),
]))
story += [t2, Spacer(1, 12)]
story += [P("Do not decide from a screenshot", "H2X"), P("Ask the recruiter to put the rate, home-time policy, bonus requirements and expected deductions in writing. Keep a copy of every document you sign.", "BodyX")]
story.append(PageBreak())

story.append(Spacer(1, 0.34*inch))
story += section_head("Step 3", "Spot the red flags before you sign", "One warning may have an innocent explanation. Several warnings together mean you should slow down and verify independently.")
red_flags = [
    ("Upfront money", "You are asked to pay a recruiter, send gift cards or use crypto before onboarding."),
    ("Pressure", "You must decide immediately or are discouraged from reading the agreement."),
    ("Vague pay", "The company advertises a weekly total but will not explain miles, rate and deductions."),
    ("Identity mismatch", "The recruiter email, phone number or payment instructions do not match the carrier."),
    ("Missing paperwork", "You cannot get the employment terms, lease terms or deductions in writing."),
    ("Unsafe expectations", "You are pushed to violate hours-of-service rules or drive unsafe equipment."),
]
rf_data = []
for i, (title, body) in enumerate(red_flags, 1):
    rf_data.append([P(str(i), "Callout"), P(f"<b>{title}</b><br/><font color='#66717D'>{body}</font>", "BodyX")])
rf = Table(rf_data, colWidths=[0.48*inch, 6.25*inch], rowHeights=[0.50*inch]*6)
rf.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,-1), HexColor("#FFECE9")), ("TEXTCOLOR", (0,0), (0,-1), RED),
    ("BOX", (0,0), (-1,-1), 0.7, LINE), ("INNERGRID", (0,0), (-1,-1), 0.45, LINE),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("ALIGN", (0,0), (0,-1), "CENTER"),
    ("LEFTPADDING", (1,0), (1,-1), 10), ("RIGHTPADDING", (1,0), (1,-1), 10),
]))
story += [rf, Spacer(1, 12)]
story += [P("Verify a carrier in three steps", "H2X")]
verify = [
    [P("1", "Callout"), P("Ask for the legal company name, USDOT number and terminal location.", "BodyX")],
    [P("2", "Callout"), P("Search the USDOT number in the official FMCSA SAFER Company Snapshot.", "BodyX")],
    [P("3", "Callout"), P("Confirm the status, phone and address. Call a published company number if anything differs.", "BodyX")],
]
vt = Table(verify, colWidths=[0.45*inch, 6.3*inch])
vt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,-1), SKY), ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (1,0), (1,-1), 10), ("TOPPADDING", (0,0), (-1,-1), 7),
]))
story += [vt, Spacer(1, 6), P("Official lookup: safer.fmcsa.dot.gov", "SmallX")]
story.append(PageBreak())

story += section_head("Step 4", "Ask the recruiter better questions", "A trustworthy recruiter should be able to answer clearly, explain tradeoffs and tell you when something is not guaranteed.")
questions = [
    "What did the median driver earn during the last four weeks?",
    "How many paid miles did that driver average?",
    "What miles are unpaid, if any?",
    "How are detention, layover, breakdown and extra stops paid?",
    "What are every one of my deductions?",
    "What is the exact home-time policy for my ZIP code?",
    "Who pays for transportation, lodging and orientation?",
    "Can I speak with a current driver on a similar route?",
]
qdata = []
for i in range(0, 8, 2):
    qdata.append([
        P(f"<font color='#1273DE'><b>{i+1:02}</b></font><br/>{questions[i]}", "BodyX"),
        P(f"<font color='#1273DE'><b>{i+2:02}</b></font><br/>{questions[i+1]}", "BodyX"),
    ])
qt = Table(qdata, colWidths=[3.3*inch, 3.3*inch], rowHeights=[0.62*inch]*4)
qt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), ICE), ("GRID", (0,0), (-1,-1), 0.55, LINE),
    ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10), ("TOPPADDING", (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
]))
story += [qt, Spacer(1, 15)]

cta = Table([[P("READY FOR A BETTER-FIT DRIVING OFFER?", "WhiteTitle"),
              P("Compare your experience, income goal and home-time needs with current opportunities.<br/><br/><b>worldwidecargoexpressllc.com</b>", "BodyX")]],
            colWidths=[3.05*inch, 3.65*inch], rowHeights=[1.25*inch])
cta.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,0), NAVY), ("BACKGROUND", (1,0), (1,0), SKY),
    ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("ALIGN", (0,0), (0,0), "CENTER"),
    ("LEFTPADDING", (0,0), (-1,-1), 15), ("RIGHTPADDING", (0,0), (-1,-1), 15),
    ("BOX", (0,0), (-1,-1), 1, NAVY),
]))
story += [cta, Spacer(1, 10), P("This guide is for general educational purposes and is not legal, tax, employment or financial advice. Verify all job terms independently before making a decision.", "SmallX")]

doc = BaseDocTemplate(
    OUT, pagesize=letter, rightMargin=0.75*inch, leftMargin=0.75*inch,
    topMargin=0.80*inch, bottomMargin=0.76*inch,
    title="The Driver Pay Checkup", author="Worldwide Cargo Express LLC",
    subject="Lead magnet example for professional truck drivers"
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([
    PageTemplate(id="all", frames=[frame], onPage=lambda c, d: cover_page(c, d) if d.page == 1 else later_page(c, d))
])
doc.build(story)
print(OUT)
