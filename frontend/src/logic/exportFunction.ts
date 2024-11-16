// exportFunctions.ts

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, ImageRun, TextRun, Paragraph } from 'docx';
import PptxGenJS from 'pptxgenjs';
const diagramName = 'sprint'
const IconHide = async (chartElement: any) => {
    const dragIcon = chartElement.querySelector('.drag-icon');
    const moreVertIcon = chartElement.querySelector('.more-vert-icon');
    if (dragIcon) dragIcon.style.display = 'none';
    if (moreVertIcon) moreVertIcon.style.display = 'none';
}

const IconHideAll = async (chartContainer: any) => {
    const dragIcon = chartContainer.querySelectorAll('.drag-icon');
    const moreVertIcon = chartContainer.querySelectorAll('.more-vert-icon');
    dragIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = 'none');
    moreVertIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = 'none');
}

const IconShow = async (chartElement: any) => {
    const dragIcon = chartElement.querySelector('.drag-icon');
    const moreVertIcon = chartElement.querySelector('.more-vert-icon');
    if (dragIcon) dragIcon.style.display = '';
    if (moreVertIcon) moreVertIcon.style.display = '';
}

const IconShowAll = async (chartContainer: any) => {
    const dragIcon = chartContainer.querySelectorAll('.drag-icon');
    const moreVertIcon = chartContainer.querySelectorAll('.more-vert-icon');
    dragIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = '');
    moreVertIcon.forEach((icon: { style: { display: string; }; }) => icon.style.display = '');
}

// Функция экспорта в PDF
export const exportChartsToPDF = async (chartId: string) => {
    // setIsModalContext(false);
    const doc = new jsPDF();
    const chartElement = document.getElementById(chartId);

    if (chartElement) {
        IconHide(chartElement);
        const canvas = await html2canvas(chartElement);
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 10, 180, (canvas.height * 180) / canvas.width + 20);
        doc.save(`${diagramName}.pdf`);
        IconShow(chartElement);
    };
};

// Функция экспорта всех диаграмм в PDF
export const exportAllChartsToPDF = async () => {
    const doc = new jsPDF();
    const chartContainer = document.querySelector('.dashboard-container');

    if (chartContainer) {
        IconHideAll(chartContainer);
        const element = chartContainer as HTMLElement;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 10, 10, 180, (canvas.height * 180) / canvas.width - 10);
        doc.save(`${diagramName}.pdf`);
        IconShowAll(chartContainer);
    };
};

// Функция экспорта в DOCX
export const exportChartsToDOCX = async (chartId: string) => {
    // setIsModalContext(false);
    const chartElement = document.getElementById(chartId);
    if (chartElement) {
        IconHide(chartElement);
        const canvas = await html2canvas(chartElement);
        const imgData = canvas.toDataURL('image/png');

        const image = new ImageRun({
            data: imgData,
            transformation: {
                width: 500,
                height: (canvas.height * 500) / canvas.width,
            },
            type: 'png',
        });

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [image],
                        }),
                    ],
                },
            ],
        });
        const buffer = await Packer.toBlob(doc);
        saveAs(buffer, `${diagramName}.docx`);
        IconShow(chartElement);
    };
};

// Функция экспорта всех диаграмм в DOCX
export const exportAllChartsToDOCX = async () => {
    const chartContainer = document.querySelector('.dashboard-container');
    if (chartContainer) {
        IconHideAll(chartContainer);
        const element = chartContainer as HTMLElement;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL('image/png');
        const image = new ImageRun({
            data: imgData,
            transformation: {
                width: 794,
                height: (canvas.height * 595) / canvas.width,
            },
            type: 'png',
        });
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun(`Диаграмма ${diagramName}`),
                            ],
                        }),
                        new Paragraph({
                            children: [image],
                        }),
                    ],
                },
            ],
        });
        const buffer = await Packer.toBlob(doc);
        saveAs(buffer, `${diagramName}.docx`);
        IconShowAll(chartContainer);
    };
};

// Функция экспорта в PPTX
export const exportChartsToPPTX = async (chartId: string) => {
    // setIsModalContext(false);
    const chartElement = document.getElementById(chartId);

    if (chartElement) {
        IconHide(chartElement);
        const canvas = await html2canvas(chartElement);
        const imgData = canvas.toDataURL("image/png");
        const pptx = new PptxGenJS();
        const slide = pptx.addSlide();
        slide.addImage({
            data: imgData,
            x: 0.5,
            y: 0.5,
            w: 7,
            h: (canvas.height * 7) / canvas.width,
        });
        pptx.writeFile({ fileName: `${diagramName}.pptx` });
        IconShow(chartElement);
    };
};

// Функция экспорта всех диаграмм в PPTX
export const exportAllChartsToPPTX = async () => {
    const chartContainer = document.querySelector('.dashboard-container');
    const pptx = new PptxGenJS();

    if (chartContainer) {
        IconHideAll(chartContainer);
        const element = chartContainer as HTMLElement;
        const canvas = await html2canvas(element);
        const imgData = canvas.toDataURL("image/png");
        const slide = pptx.addSlide();
        slide.addImage({
            data: imgData,
            x: 0.5,
            y: 0.5,
            w: 9,
            h: (canvas.height * 9) / canvas.width,
        });
        pptx.writeFile({ fileName: `Отчет.pptx` });
        IconShowAll(chartContainer);
    };
};
