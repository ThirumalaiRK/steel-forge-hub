-- Insert sample resources data (matching the mock data from ResourceLibraryPage)
INSERT INTO public.resources (title, category, format, size, image, summary, file_url, is_gated) VALUES
(
    '2026 Industrial Robotics Market Report',
    'Whitepaper',
    'PDF',
    '4.2 MB',
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&q=80',
    'In-depth analysis of global automation trends, ROI benchmarks, and the shift towards collaborative robotics.',
    'https://example.com/downloads/robotics-market-report-2026.pdf',
    true
),
(
    'AIRS-X100 Technical Datasheet',
    'Technical Spec',
    'PDF',
    '1.5 MB',
    'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=600&q=80',
    'Detailed mechanical specifications, wiring diagrams, and load charts for the X100 heavy-duty arm.',
    'https://example.com/downloads/airs-x100-datasheet.pdf',
    false
),
(
    'Predictive Maintenance Guide',
    'E-Book',
    'PDF',
    '8.1 MB',
    'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=600&q=80',
    'How to use AI-driven vision systems to prevent downtime before it happens. A comprehensive playbook.',
    'https://example.com/downloads/predictive-maintenance-guide.pdf',
    true
),
(
    'Programming the AIRS Vision API',
    'Developer Doc',
    'PDF',
    '2.3 MB',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80',
    'API reference for integrating Python/C++ control logic with AIRS vision controllers.',
    'https://example.com/downloads/vision-api-docs.pdf',
    true
),
(
    'Safety Standards Compliance Checklist',
    'Checklist',
    'PDF',
    '0.5 MB',
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600&q=80',
    'Ensure your workcell meets ISO 10218-1 safety standards with this essential deployment checklist.',
    'https://example.com/downloads/safety-checklist.pdf',
    false
),
(
    'Lean Manufacturing with Cobots',
    'Case Study Collection',
    'PDF',
    '12 MB',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
    'Real-world examples of how small to mid-sized factories increased output by 300% using cobots.',
    'https://example.com/downloads/lean-manufacturing-cobots.pdf',
    true
);
