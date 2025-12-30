"""
PDF Generation Service
Handles generation of consent receipts and other PDF documents.

This module provides a modular, reusable PDF generation system with
consistent styling and structure for compliance documents.
"""
import io
import json
from datetime import datetime
from typing import Optional, List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch

from app.constants import PDFStyle


class ConsentReceiptPDF:
    """
    Generator for consent receipt PDF documents.

    Creates legally compliant consent receipts with consistent styling,
    supporting DPDP Act and GDPR requirements.

    Attributes:
        buffer: BytesIO buffer to write PDF content.
        styles: ReportLab style sheet for text formatting.
        story: List of PDF elements (flowables).
    """

    def __init__(self):
        """Initialize PDF generator with default styles."""
        self.buffer = io.BytesIO()
        self.styles = getSampleStyleSheet()
        self.story: List[Any] = []
        self._setup_custom_styles()

    def _setup_custom_styles(self) -> None:
        """Configure custom paragraph styles for the document."""
        # Title style
        self.title_style = ParagraphStyle(
            'ConsentTitle',
            parent=self.styles['Heading1'],
            fontSize=PDFStyle.TITLE_FONT_SIZE,
            spaceAfter=PDFStyle.TITLE_SPACING,
            textColor=colors.HexColor(PDFStyle.PRIMARY_COLOR)
        )

        # Signature/code style
        self.signature_style = ParagraphStyle(
            'Signature',
            parent=self.styles['Normal'],
            fontSize=PDFStyle.SIGNATURE_FONT_SIZE,
            fontName='Courier',
            backColor=colors.HexColor(PDFStyle.CODE_BG_COLOR),
            borderPadding=PDFStyle.CODE_BORDER_PADDING,
            wordWrap='CJK'
        )

        # Footer style
        self.footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=PDFStyle.FOOTER_FONT_SIZE,
            textColor=colors.HexColor(PDFStyle.FOOTER_COLOR),
            alignment=1  # Center aligned
        )

    def _create_table(self, data: List[List[str]]) -> Table:
        """
        Create a styled data table.

        Args:
            data: 2D list of table cell contents [[label, value], ...].

        Returns:
            Configured Table object with consistent styling.
        """
        table = Table(
            data,
            colWidths=[PDFStyle.LABEL_COL_WIDTH * inch, PDFStyle.VALUE_COL_WIDTH * inch]
        )
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor(PDFStyle.HEADER_BG_COLOR)),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), PDFStyle.BODY_FONT_SIZE),
            ('PADDING', (0, 0), (-1, -1), PDFStyle.CELL_PADDING),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor(PDFStyle.BORDER_COLOR)),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        return table

    def _add_section(self, title: str, data: List[List[str]]) -> None:
        """
        Add a titled section with data table.

        Args:
            title: Section heading text.
            data: Table data for the section.
        """
        self.story.append(Paragraph(title, self.styles['Heading2']))
        self.story.append(self._create_table(data))
        self.story.append(Spacer(1, PDFStyle.SECTION_SPACING))

    def generate(
        self,
        receipt_id: str,
        consent_uuid: str,
        status: str,
        granted_at: datetime,
        expires_at: Optional[datetime],
        user_name: str,
        user_email: str,
        fiduciary_name: str,
        fiduciary_email: str,
        purpose_name: str,
        purpose_description: str,
        legal_basis: str,
        data_categories: List[str],
        retention_days: int,
        signature: str
    ) -> io.BytesIO:
        """
        Generate the complete consent receipt PDF.

        Args:
            receipt_id: Unique receipt identifier.
            consent_uuid: UUID of the consent record.
            status: Current consent status (granted/revoked).
            granted_at: Timestamp when consent was granted.
            expires_at: Optional expiry timestamp.
            user_name: Name of the data principal.
            user_email: Email of the data principal.
            fiduciary_name: Name of the data fiduciary organization.
            fiduciary_email: Contact email for the fiduciary.
            purpose_name: Name of the consent purpose.
            purpose_description: Detailed description of the purpose.
            legal_basis: Legal basis for data processing.
            data_categories: List of data categories covered.
            retention_days: Data retention period in days.
            signature: HMAC signature for verification.

        Returns:
            BytesIO buffer containing the generated PDF.
        """
        doc = SimpleDocTemplate(
            self.buffer,
            pagesize=letter,
            topMargin=PDFStyle.TOP_MARGIN_INCHES * inch
        )

        # Title
        self.story.append(Paragraph("CONSENT RECEIPT", self.title_style))
        self.story.append(Paragraph(
            "Eigensparse Consent Management System",
            self.styles['Normal']
        ))
        self.story.append(Spacer(1, PDFStyle.SECTION_SPACING))

        # Receipt info
        self._add_section("RECEIPT DETAILS", [
            ["Receipt ID", receipt_id],
            ["Consent UUID", consent_uuid],
            ["Status", status.upper()],
            ["Granted At", granted_at.strftime("%Y-%m-%d %H:%M:%S UTC")],
            ["Expires At", expires_at.strftime("%Y-%m-%d %H:%M:%S UTC") if expires_at else "N/A"],
        ])

        # Data principal
        self._add_section("DATA PRINCIPAL", [
            ["Name", user_name],
            ["Email", user_email],
        ])

        # Data fiduciary
        self._add_section("DATA FIDUCIARY", [
            ["Organization", fiduciary_name],
            ["Contact", fiduciary_email],
        ])

        # Purpose
        self._add_section("CONSENT PURPOSE", [
            ["Purpose", purpose_name],
            ["Description", purpose_description],
            ["Legal Basis", legal_basis],
            ["Data Categories", ", ".join(data_categories)],
            ["Retention Period", f"{retention_days} days"],
        ])

        # Signature section
        self.story.append(Paragraph(
            "CRYPTOGRAPHIC SIGNATURE (HMAC-SHA256)",
            self.styles['Heading2']
        ))
        self.story.append(Paragraph(signature, self.signature_style))
        self.story.append(Spacer(1, PDFStyle.SECTION_SPACING))

        # Footer
        self.story.append(Paragraph(
            "This receipt is compliant with DPDP Act 2023 (India) and GDPR (EU).<br/>"
            "Generated by Eigensparse Consent Management System",
            self.footer_style
        ))

        # Build the document
        doc.build(self.story)
        self.buffer.seek(0)
        return self.buffer


def generate_consent_receipt_pdf(
    receipt_id: str,
    consent_uuid: str,
    status: str,
    granted_at: datetime,
    expires_at: Optional[datetime],
    user_name: str,
    user_email: str,
    fiduciary_name: str,
    fiduciary_email: str,
    purpose_name: str,
    purpose_description: str,
    legal_basis: str,
    data_categories: List[str],
    retention_days: int,
    signature: str
) -> io.BytesIO:
    """
    Convenience function to generate a consent receipt PDF.

    This is the primary interface for PDF generation, wrapping the
    ConsentReceiptPDF class for simple usage.

    Args:
        See ConsentReceiptPDF.generate() for parameter documentation.

    Returns:
        BytesIO buffer containing the generated PDF.

    Example:
        >>> pdf_buffer = generate_consent_receipt_pdf(
        ...     receipt_id="RCP-123",
        ...     consent_uuid="abc-123",
        ...     status="granted",
        ...     ...
        ... )
        >>> return StreamingResponse(pdf_buffer, media_type="application/pdf")
    """
    generator = ConsentReceiptPDF()
    return generator.generate(
        receipt_id=receipt_id,
        consent_uuid=consent_uuid,
        status=status,
        granted_at=granted_at,
        expires_at=expires_at,
        user_name=user_name,
        user_email=user_email,
        fiduciary_name=fiduciary_name,
        fiduciary_email=fiduciary_email,
        purpose_name=purpose_name,
        purpose_description=purpose_description,
        legal_basis=legal_basis,
        data_categories=data_categories,
        retention_days=retention_days,
        signature=signature
    )
