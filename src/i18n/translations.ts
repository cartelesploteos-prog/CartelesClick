export type Language = "es" | "en" | "pt-BR";

export interface TranslationDictionary {
  // Navigation & Menu
  nav_poster: string;
  nav_poster_desc: string;
  nav_cotizador: string;
  nav_cotizador_desc: string;
  nav_materiales: string;
  nav_materiales_desc: string;
  nav_mayoristas: string;
  nav_mayoristas_desc: string;
  nav_portfolio: string;
  nav_portfolio_desc: string;
  nav_pedidos: string;
  nav_pedidos_desc: string;
  nav_cuenta: string;
  nav_cuenta_desc: string;
  nav_diccionario: string;
  nav_diccionario_desc: string;
  nav_blog: string;
  nav_blog_desc: string;
  nav_admin: string;
  nav_admin_desc: string;

  // Groups
  group_design_tools: string;
  group_commercial_services: string;
  group_technical_resources: string;

  // Header & Drawer
  search_placeholder: string;
  ai_engine_badge: string;
  ai_engine_title: string;
  ai_engine_desc: string;
  design_with_ai: string;
  currency_label: string;
  language_label: string;
  close_menu: string;
  clear: string;
  home: string;

  // Floating Dock
  dock_home: string;
  dock_quoter: string;
  dock_ai_poster: string;
  dock_materials: string;
  dock_cart: string;
  dock_account: string;

  // Common UI
  prod_24hs: string;
  prod_24hs_sub: string;
  national_shipping: string;
  national_shipping_sub: string;
  whatsapp_workshop: string;

  // Footer & Badges
  all_rights_reserved: string;
  digital_printing: string;
  payments_processed: string;

  // Cart Drawer
  cart_title: string;
  cart_configured: string;
  cart_empty_title: string;
  cart_empty_desc: string;
  cart_subtotal: string;
  cart_shipping: string;
  cart_total: string;
  cart_checkout: string;
  cart_pickup_workshop: string;
  cart_dispatch_express: string;

  // Home Page
  hero_title: string;
  hero_subtitle: string;
  hero_cta_quoter: string;
  hero_cta_ai: string;
  explore_bento_title: string;
  explore_bento_subtitle: string;
  wholesalers_banner_title: string;
  wholesalers_banner_subtitle: string;
  wholesalers_banner_cta: string;
  faq_title: string;
  faq_subtitle: string;

  // Quoter (Cotizador)
  quoter_title: string;
  quoter_subtitle: string;
  step_category: string;
  step_material: string;
  step_dimensions: string;
  step_finishings: string;
  step_file: string;
  step_summary: string;
  label_width: string;
  label_height: string;
  label_quantity: string;
  add_to_cart_button: string;
  recalculating_server: string;

  // Poster Creator AI
  poster_title: string;
  poster_subtitle: string;
  prompt_placeholder: string;
  generate_button: string;
  remix_prompt: string;
  export_pdf: string;

  // Orders (Seguimiento)
  orders_title: string;
  orders_subtitle: string;
  status_pending_payment: string;
  status_in_production: string;
  status_finishing: string;
  status_dispatched: string;
  status_delivered: string;

  // Wholesale B2B
  wholesale_title: string;
  wholesale_subtitle: string;
  tier_inicio: string;
  tier_agencia: string;
  tier_partner: string;

  // Catalog & Materials
  materials_title: string;
  materials_subtitle: string;
  filter_all: string;

  // Account
  account_title: string;
  account_subtitle: string;
  tab_profile: string;
  tab_orders: string;
  tab_billing: string;

  // Dictionary & Blog
  dictionary_title: string;
  blog_title: string;
  portfolio_title: string;

  // Additional UI Keys for Home & Components
  hero_heading_1: string;
  hero_heading_highlight: string;
  hero_description: string;
  hero_btn_quote_live: string;
  hero_btn_6steps: string;
  hero_prompt_input_placeholder: string;
  hero_prompt_btn_generate: string;
  feed_tab_trending: string;
  feed_tab_banners: string;
  feed_tab_vinyls: string;
  feed_tab_rigid: string;
  feed_tab_illuminated: string;
  btn_use_prompt: string;
  btn_copy_prompt: string;
  btn_prompt_copied: string;
  sim_title: string;
  sim_subtitle: string;
  sim_material_label: string;
  sim_width_label: string;
  sim_height_label: string;
  sim_total_surface: string;
  sim_btn_quote: string;
  categories_section_title: string;
  categories_section_subtitle: string;
  solutions_section_title: string;
  solutions_section_subtitle: string;
  why_us_title: string;
  why_us_subtitle: string;
  b2b_badge: string;
  view_all_materials: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  es: {
    nav_poster: "Póster Creator con IA",
    nav_poster_desc: "Generador de carteles con tipografía y capas 1440 DPI",
    nav_cotizador: "Cotizador en Vivo (m² y Placas)",
    nav_cotizador_desc: "Cálculo instantáneo por superficie, despiece y acabados",
    nav_materiales: "Catálogo Técnico de Sustratos",
    nav_materiales_desc: "Lonas, Vinilos, PVC, PAI y Portabanners",
    nav_mayoristas: "Gremios & Mayoristas B2B",
    nav_mayoristas_desc: "Tarifas por volumen, bobinas y revendedores",
    nav_portfolio: "Portfolio de Trabajos Reales",
    nav_portfolio_desc: "Marquesinas, vidrieras, eventos y cartelería",
    nav_pedidos: "Seguimiento de Pedidos",
    nav_pedidos_desc: "Estado de impresión, empaque y despacho",
    nav_cuenta: "Mi Cuenta & Facturación",
    nav_cuenta_desc: "Historial de compras, datos de factura A/B",
    nav_diccionario: "Diccionario de Imprenta & Cartelería",
    nav_diccionario_desc: "Glosario técnico: sustratos, ojales, DPI y demasías",
    nav_blog: "Blog de Pre-Prensa y Guías",
    nav_blog_desc: "Artículos sobre resolución, formatos y armado de archivos",
    nav_admin: "Panel de Administración Taller",
    nav_admin_desc: "Control de producción, precios y stock",

    group_design_tools: "Herramientas de Diseño & Cotización",
    group_commercial_services: "Comercial & Servicios",
    group_technical_resources: "Recursos Técnicos & Taller",

    search_placeholder: "Buscar en el catálogo...",
    ai_engine_badge: "Motor de IA",
    ai_engine_title: "Generá pósters y carteles listos para imprimir",
    ai_engine_desc: "Formatos de taller y renderizado 1440 DPI.",
    design_with_ai: "Diseñar con IA",
    currency_label: "Moneda",
    language_label: "Idioma / Language",
    close_menu: "Cerrar menú",
    clear: "Limpiar",
    home: "Inicio",

    dock_home: "Inicio",
    dock_quoter: "Cotizar",
    dock_ai_poster: "Póster IA",
    dock_materials: "Sustratos",
    dock_cart: "Carrito",
    dock_account: "Cuenta",

    prod_24hs: "Producción 24 Horas",
    prod_24hs_sub: "Despacho express a todo el país",
    national_shipping: "Envíos Federales",
    national_shipping_sub: "Retiro en taller o flete a expreso",
    whatsapp_workshop: "WhatsApp Taller",

    all_rights_reserved: "Todos los derechos reservados.",
    digital_printing: "Impresión digital de gran formato.",
    payments_processed: "Pagos procesados con Mercado Pago",

    cart_title: "Tu Carrito de Impresión",
    cart_configured: "configurados",
    cart_empty_title: "Tu carrito está vacío",
    cart_empty_desc: "Utilizá nuestro cotizador o el creador de pósters con IA para agregar tus trabajos de cartelería.",
    cart_subtotal: "Subtotal de materiales",
    cart_shipping: "Costo de envío",
    cart_total: "Total Estimado",
    cart_checkout: "Confirmar Pedido",
    cart_pickup_workshop: "Retiro en Taller (Gratis)",
    cart_dispatch_express: "Despacho Express a Todo el País",

    hero_title: "Impresión Digital Gran Formato y Cartelería",
    hero_subtitle: "Cotizaciones en vivo por m² y placas, motor de IA para pósters 1440 DPI y envíos a todo el país.",
    hero_cta_quoter: "Cotizar Trabajo (m²)",
    hero_cta_ai: "Diseñar con IA",
    explore_bento_title: "Explorador de Diseños & Estilos",
    explore_bento_subtitle: "Modelos de cartelería, marquesinas y soluciones para negocios",
    wholesalers_banner_title: "Gremios, Carteleros & Agencias B2B",
    wholesalers_banner_subtitle: "Accedé a tarifas especiales por rol (Inicio, Agencia, Partner) y bobinas cerradas.",
    wholesalers_banner_cta: "Ver Tarifas Gremio",
    faq_title: "Preguntas Frecuentes de Taller",
    faq_subtitle: "Respuestas técnicas sobre sustratos, archivos de imprenta y tiempos de despacho",

    quoter_title: "Cotizador de Impresión Gran Formato",
    quoter_subtitle: "Cálculo 100% servidor con despiece, demasías y terminaciones de taller",
    step_category: "1. Categoría",
    step_material: "2. Sustrato",
    step_dimensions: "3. Dimensiones",
    step_finishings: "4. Terminaciones",
    step_file: "5. Archivo",
    step_summary: "6. Resumen",
    label_width: "Ancho (cm)",
    label_height: "Alto (cm)",
    label_quantity: "Cantidad (unid.)",
    add_to_cart_button: "Agregar al Carrito de Impresión",
    recalculating_server: "Calculando en servidor...",

    poster_title: "Generador de Carteles & Pósters con IA",
    poster_subtitle: "Renderizado de capas en resolución 1440 DPI listo para imprenta",
    prompt_placeholder: "Escribí tu idea de cartel o marquesina...",
    generate_button: "Generar con IA",
    remix_prompt: "Mejorar Prompt con IA",
    export_pdf: "Exportar PDF / Imprimir",

    orders_title: "Seguimiento de Producción y Pedidos",
    orders_subtitle: "Integración oficial con Mercado Pago y estado en tiempo real",
    status_pending_payment: "Pendiente de Pago (Mercado Pago)",
    status_in_production: "En Producción de Taller",
    status_finishing: "Confección & Refuerzos",
    status_dispatched: "Despachado / En Envío",
    status_delivered: "Entregado",

    wholesale_title: "Programa para Gremios, Carteleros y Agencias B2B",
    wholesale_subtitle: "Accedé a precios de costo por m², compras en volumen y atención prioritaria.",
    tier_inicio: "Nivel Inicio / Particular",
    tier_agencia: "Nivel Agencia B2B (-10%)",
    tier_partner: "Nivel Partner Gremio (-15%)",

    materials_title: "Catálogo Técnico de Sustratos & Materiales",
    materials_subtitle: "Especificaciones de durabilidad, ancho de bobina y aplicaciones recomendadas",
    filter_all: "Todos los materiales",

    account_title: "Mi Cuenta & Facturación A/B",
    account_subtitle: "Gestión de datos de facturación, historial de pedidos y direcciones",
    tab_profile: "Perfil & Empresa",
    tab_orders: "Historial de Pedidos",
    tab_billing: "Datos de Facturación",

    dictionary_title: "Diccionario Técnico de Imprenta & Cartelería",
    blog_title: "Blog de Pre-Prensa y Guías de Taller",
    portfolio_title: "Portfolio de Trabajos Reales",

    hero_heading_1: "Impresión, Lonas y Vinilos con",
    hero_heading_highlight: "Cotización en Vivo",
    hero_description: "Ingresá las medidas de tu cartel o marquesina para calcular el precio exacto m² al instante y pedir directamente a fábrica.",
    hero_btn_quote_live: "Cotizá en Vivo (24/7)",
    hero_btn_6steps: "Compra Ágil en 6 Pasos",
    hero_prompt_input_placeholder: "Diseñá con IA: describí tu cartel o marquesina...",
    hero_prompt_btn_generate: "Crear con IA",
    feed_tab_trending: "Tendencias",
    feed_tab_banners: "Lonas & Banners",
    feed_tab_vinyls: "Vinilos & Vidrieras",
    feed_tab_rigid: "Rígidos & PVC",
    feed_tab_illuminated: "Cajas de Luz",
    btn_use_prompt: "Usar en Póster Creator",
    btn_copy_prompt: "Copiar Prompt",
    btn_prompt_copied: "¡Copiado!",
    sim_title: "Simulador de Medidas y Costo Estimado",
    sim_subtitle: "Arrastrá los controles para visualizar las dimensiones reales a escala y calcular tu inversión de inmediato.",
    sim_material_label: "Material Seleccionado",
    sim_width_label: "Ancho",
    sim_height_label: "Alto",
    sim_total_surface: "Superficie Total",
    sim_btn_quote: "Cotizar este trabajo a medida",
    categories_section_title: "Sustratos Técnicos de Imprenta",
    categories_section_subtitle: "Lonas, Vinilos, Rígidos y Sistemas de Exhibición producidos con tintas UV y ecosolventes de alta resistencia.",
    solutions_section_title: "Soluciones por Tipo de Negocio",
    solutions_section_subtitle: "Materiales recomendados según el lugar de instalación y durabilidad requerida.",
    why_us_title: "¿Por qué elegir Carteles.Click?",
    why_us_subtitle: "Tecnología de punta, tiempos récord y transparencia total en precios de fábrica.",
    b2b_badge: "Venta Corporativa",
    view_all_materials: "Ver Catálogo Completo",
  },
  en: {
    nav_poster: "AI Poster Creator",
    nav_poster_desc: "Sign & banner generator with typography & 1440 DPI layers",
    nav_cotizador: "Live Quoter (m² & Rigid Boards)",
    nav_cotizador_desc: "Instant calculation by surface area, nesting & finishings",
    nav_materiales: "Technical Substrate Catalog",
    nav_materiales_desc: "Banners, Vinyls, PVC, High-Impact Polystyrene & Display Stands",
    nav_mayoristas: "Wholesale & B2B Trade",
    nav_mayoristas_desc: "Bulk rates, full rolls & reseller program",
    nav_portfolio: "Real Projects Portfolio",
    nav_portfolio_desc: "Illuminated signs, storefront windows, events & signage",
    nav_pedidos: "Order Tracking",
    nav_pedidos_desc: "Real-time printing, packaging & dispatch status",
    nav_cuenta: "My Account & Billing",
    nav_cuenta_desc: "Purchase history, invoice details & saved addresses",
    nav_diccionario: "Printing & Signage Dictionary",
    nav_diccionario_desc: "Technical glossary: substrates, eyelets, DPI & bleed margins",
    nav_blog: "Pre-Press & Guide Blog",
    nav_blog_desc: "Articles on resolution, file formats & prepress setup",
    nav_admin: "Workshop Admin Panel",
    nav_admin_desc: "Production control, pricing & substrate stock",

    group_design_tools: "Design & Live Quoting Tools",
    group_commercial_services: "Commercial & Services",
    group_technical_resources: "Technical Resources & Workshop",

    search_placeholder: "Search catalog...",
    ai_engine_badge: "AI Engine",
    ai_engine_title: "Generate print-ready posters and signs",
    ai_engine_desc: "Workshop formats and 1440 DPI rendering.",
    design_with_ai: "Design with AI",
    currency_label: "Currency",
    language_label: "Language / Idioma",
    close_menu: "Close menu",
    clear: "Clear",
    home: "Home",

    dock_home: "Home",
    dock_quoter: "Quote",
    dock_ai_poster: "AI Poster",
    dock_materials: "Substrates",
    dock_cart: "Cart",
    dock_account: "Account",

    prod_24hs: "24-Hour Production",
    prod_24hs_sub: "Express dispatch nationwide",
    national_shipping: "Nationwide Shipping",
    national_shipping_sub: "Workshop pickup or freight carrier",
    whatsapp_workshop: "Workshop WhatsApp",

    all_rights_reserved: "All rights reserved.",
    digital_printing: "Wide format digital printing.",
    payments_processed: "Payments processed via Mercado Pago",

    cart_title: "Your Print Cart",
    cart_configured: "configured",
    cart_empty_title: "Your cart is empty",
    cart_empty_desc: "Use our live quoter or AI poster creator to add your print jobs.",
    cart_subtotal: "Materials Subtotal",
    cart_shipping: "Shipping Cost",
    cart_total: "Estimated Total",
    cart_checkout: "Confirm Order",
    cart_pickup_workshop: "Workshop Pickup (Free)",
    cart_dispatch_express: "Express Nationwide Dispatch",

    hero_title: "Wide Format Digital Printing & Signage",
    hero_subtitle: "Live quotes by m² and rigid boards, AI poster engine 1440 DPI and nationwide shipping.",
    hero_cta_quoter: "Quote Job (m²)",
    hero_cta_ai: "Design with AI",
    explore_bento_title: "Design & Style Explorer",
    explore_bento_subtitle: "Signage models, store awnings & display templates",
    wholesalers_banner_title: "Trade, Sign Makers & B2B Agencies",
    wholesalers_banner_subtitle: "Access special tier rates (Entry, Agency, Partner) and full material rolls.",
    wholesalers_banner_cta: "View Trade Rates",
    faq_title: "Workshop FAQ",
    faq_subtitle: "Technical answers on substrates, press files and shipping times",

    quoter_title: "Wide Format Print Quoter",
    quoter_subtitle: "100% server-calculated with nesting, bleeds & workshop finishings",
    step_category: "1. Category",
    step_material: "2. Substrate",
    step_dimensions: "3. Dimensions",
    step_finishings: "4. Finishings",
    step_file: "5. File",
    step_summary: "6. Summary",
    label_width: "Width (cm)",
    label_height: "Height (cm)",
    label_quantity: "Quantity (units)",
    add_to_cart_button: "Add to Print Cart",
    recalculating_server: "Calculating on server...",

    poster_title: "AI Poster & Sign Generator",
    poster_subtitle: "Layer rendering at 1440 DPI resolution ready for press",
    prompt_placeholder: "Describe your sign or banner idea...",
    generate_button: "Generate with AI",
    remix_prompt: "Enhance Prompt with AI",
    export_pdf: "Export PDF / Print",

    orders_title: "Order & Production Tracking",
    orders_subtitle: "Official Mercado Pago integration & real-time status",
    status_pending_payment: "Pending Payment (Mercado Pago)",
    status_in_production: "In Workshop Production",
    status_finishing: "Assembly & Finishing",
    status_dispatched: "Dispatched / Shipping",
    status_delivered: "Delivered",

    wholesale_title: "Trade, Signmaker & B2B Agency Program",
    wholesale_subtitle: "Access cost-based prices per m², bulk orders & priority support.",
    tier_inicio: "Entry Tier / Retail",
    tier_agencia: "Agency Tier (-10%)",
    tier_partner: "Partner Guild Tier (-15%)",

    materials_title: "Technical Substrate & Material Catalog",
    materials_subtitle: "Durability specs, roll width & recommended applications",
    filter_all: "All Materials",

    account_title: "My Account & Tax Billing",
    account_subtitle: "Manage billing info, order history & saved addresses",
    tab_profile: "Profile & Business",
    tab_orders: "Order History",
    tab_billing: "Billing Data",

    dictionary_title: "Printing & Signage Technical Dictionary",
    blog_title: "Pre-Press Blog & Workshop Guides",
    portfolio_title: "Real Projects Portfolio",

    hero_heading_1: "Signs, Banners & Vinyl with",
    hero_heading_highlight: "Live Instant Quotes",
    hero_description: "Enter the dimensions of your sign or banner to instantly calculate the exact m² price and order directly from the workshop.",
    hero_btn_quote_live: "Live Quote (24/7)",
    hero_btn_6steps: "Fast 6-Step Purchase",
    hero_prompt_input_placeholder: "Design with AI: describe your sign or banner...",
    hero_prompt_btn_generate: "Create with AI",
    feed_tab_trending: "Trending",
    feed_tab_banners: "Banners & Flex",
    feed_tab_vinyls: "Vinyls & Windows",
    feed_tab_rigid: "Rigid Boards & PVC",
    feed_tab_illuminated: "Lightboxes",
    btn_use_prompt: "Use in Poster Creator",
    btn_copy_prompt: "Copy Prompt",
    btn_prompt_copied: "Copied!",
    sim_title: "Dimensions & Estimated Cost Simulator",
    sim_subtitle: "Drag the sliders to visualize real scale dimensions and calculate your project investment immediately.",
    sim_material_label: "Selected Substrate",
    sim_width_label: "Width",
    sim_height_label: "Height",
    sim_total_surface: "Total Surface",
    sim_btn_quote: "Quote this custom job",
    categories_section_title: "Technical Print Substrates",
    categories_section_subtitle: "Banners, Vinyls, Rigid Boards and Display Systems produced with high-durability UV and eco-solvent inks.",
    solutions_section_title: "Solutions by Industry",
    solutions_section_subtitle: "Recommended materials based on installation environment and required durability.",
    why_us_title: "Why Choose Carteles.Click?",
    why_us_subtitle: "Cutting-edge technology, record turnaround times and total factory price transparency.",
    b2b_badge: "Corporate & B2B",
    view_all_materials: "View Full Catalog",
  },
  "pt-BR": {
    nav_poster: "Criador de Pôster com IA",
    nav_poster_desc: "Gerador de faixas e cartazes com tipografia e camadas 1440 DPI",
    nav_cotizador: "Orcamentador em Tempo Real (m² e Placas)",
    nav_cotizador_desc: "Cálculo instantâneo por área, aproveitamento e acabamentos",
    nav_materiales: "Catálogo Técnico de Substratos",
    nav_materiales_desc: "Lonas, Vinis, PVC, Poliestireno e Banners Roll-Up",
    nav_mayoristas: "Atacado e B2B para Revenda",
    nav_mayoristas_desc: "Preços por volume, bobinas fechadas e revendedores",
    nav_portfolio: "Portfólio de Trabalhos Reais",
    nav_portfolio_desc: "Fachadas luminosas, vitrines, eventos e comunicação visual",
    nav_pedidos: "Rastreamento de Pedidos",
    nav_pedidos_desc: "Status em tempo real de impressão, embalagem e envio",
    nav_cuenta: "Minha Conta e Faturamento",
    nav_cuenta_desc: "Histórico de compras, notas fiscais e dados da empresa",
    nav_diccionario: "Dicionário de Impressão e Comunicação Visual",
    nav_diccionario_desc: "Glossário técnico: substratos, ilhóses, DPI e margens de sangria",
    nav_blog: "Blog de Pré-Impressão e Guias",
    nav_blog_desc: "Artigos sobre resolução, formatos de arquivo e fechamento",
    nav_admin: "Painel Administrativo da Oficina",
    nav_admin_desc: "Controle de produção, preços e estoque de materiais",

    group_design_tools: "Ferramentas de Design e Orçamento",
    group_commercial_services: "Comercial e Serviços",
    group_technical_resources: "Recursos Técnicos e Oficina",

    search_placeholder: "Buscar no catálogo...",
    ai_engine_badge: "Motor de IA",
    ai_engine_title: "Gere pôsteres e placas prontas para impressão",
    ai_engine_desc: "Formatos de oficina e renderização 1440 DPI.",
    design_with_ai: "Criar com IA",
    currency_label: "Moeda",
    language_label: "Idioma / Language",
    close_menu: "Fechar menu",
    clear: "Limpar",
    home: "Início",

    dock_home: "Início",
    dock_quoter: "Cotar",
    dock_ai_poster: "Pôster IA",
    dock_materials: "Substratos",
    dock_cart: "Carrinho",
    dock_account: "Conta",

    prod_24hs: "Produção em 24 Horas",
    prod_24hs_sub: "Envio expresso para todo o país",
    national_shipping: "Envios Nacionais",
    national_shipping_sub: "Retirada na gráfica ou transportadora",
    whatsapp_workshop: "WhatsApp da Oficina",

    all_rights_reserved: "Todos os direitos reservados.",
    digital_printing: "Impressão digital de grande formato.",
    payments_processed: "Pagamentos processados via Mercado Pago",

    cart_title: "Seu Carrinho de Impressão",
    cart_configured: "configurados",
    cart_empty_title: "Seu carrinho está vazio",
    cart_empty_desc: "Use nosso orçamentador ou criador de pôsteres com IA para adicionar seus trabalhos.",
    cart_subtotal: "Subtotal de materiais",
    cart_shipping: "Custo de envio",
    cart_total: "Total Estimado",
    cart_checkout: "Confirmar Pedido",
    cart_pickup_workshop: "Retirar na Oficina (Grátis)",
    cart_dispatch_express: "Envio Expresso Nacional",

    hero_title: "Impressão Digital de Grande Formato e Comunicação Visual",
    hero_subtitle: "Orçamentos em tempo real por m² e placas, motor de IA para pôsteres 1440 DPI e envios para todo o país.",
    hero_cta_quoter: "Orcar Trabalho (m²)",
    hero_cta_ai: "Criar com IA",
    explore_bento_title: "Explorador de Designs e Estilos",
    explore_bento_subtitle: "Modelos de comunicação visual, fachadas e vitrines",
    wholesalers_banner_title: "Revendedores, Comunicação Visual e Agências B2B",
    wholesalers_banner_subtitle: "Acesse tarifas especiais por nível (Início, Agência, Partner) e bobinas fechadas.",
    wholesalers_banner_cta: "Ver Tarifas de Atacado",
    faq_title: "Perguntas Frequentes da Oficina",
    faq_subtitle: "Respostas técnicas sobre substratos, arquivos de impressão e prazos de envio",

    quoter_title: "Orçamentador de Impressão de Grande Formato",
    quoter_subtitle: "Cálculo 100% via servidor com aproveitamento, sangrias e acabamentos",
    step_category: "1. Categoria",
    step_material: "2. Substrato",
    step_dimensions: "3. Dimensões",
    step_finishings: "4. Acabamentos",
    step_file: "5. Arquivo",
    step_summary: "6. Resumo",
    label_width: "Largura (cm)",
    label_height: "Altura (cm)",
    label_quantity: "Quantidade (unid.)",
    add_to_cart_button: "Adicionar ao Carrinho de Impressão",
    recalculating_server: "Calculando no servidor...",

    poster_title: "Gerador de Pôsteres e Cartazes com IA",
    poster_subtitle: "Renderização de camadas em resolução 1440 DPI pronta para gráfica",
    prompt_placeholder: "Escreva sua idéia de cartaz ou fachada...",
    generate_button: "Gerar com IA",
    remix_prompt: "Melhorar Prompt com IA",
    export_pdf: "Exportar PDF / Imprimir",

    orders_title: "Acompanhamento de Produção e Pedidos",
    orders_subtitle: "Integração oficial com Mercado Pago e status em tempo real",
    status_pending_payment: "Pagamento Pendente (Mercado Pago)",
    status_in_production: "Em Produção na Oficina",
    status_finishing: "Acabamento e Reforços",
    status_dispatched: "Enviado / Envio em Andamento",
    status_delivered: "Entregue",

    wholesale_title: "Programa para Revendedores, Comunicação Visual e Agências B2B",
    wholesale_subtitle: "Acesse preços de custo por m², compras em volume e atendimento prioritário.",
    tier_inicio: "Nível Início / Particular",
    tier_agencia: "Nível Agência B2B (-10%)",
    tier_partner: "Nível Partner Revenda (-15%)",

    materials_title: "Catálogo Técnico de Substratos e Materiais",
    materials_subtitle: "Especificações de durabilidade, largura de bobina e aplicações recomendadas",
    filter_all: "Todos os Materiais",

    account_title: "Minha Conta e Faturamento",
    account_subtitle: "Gestão de dados de faturamento, histórico e endereços",
    tab_profile: "Perfil e Empresa",
    tab_orders: "Histórico de Pedidos",
    tab_billing: "Dados de Faturamento",

    dictionary_title: "Dicionário Técnico de Impressão e Comunicação Visual",
    blog_title: "Blog de Pré-Impressão e Guias da Oficina",
    portfolio_title: "Portfólio de Trabalhos Reais",

    hero_heading_1: "Comunicação Visual, Lonas e Vinis com",
    hero_heading_highlight: "Orçamento em Tempo Real",
    hero_description: "Insira as medidas do seu cartaz ou fachada para calcular o preço exato por m² na hora e pedir direto da fábrica.",
    hero_btn_quote_live: "Orçamento em Tempo Real (24/7)",
    hero_btn_6steps: "Compra Ágil em 6 Passos",
    hero_prompt_input_placeholder: "Crie com IA: descreva sua placa ou fachada...",
    hero_prompt_btn_generate: "Criar com IA",
    feed_tab_trending: "Tendências",
    feed_tab_banners: "Lonas e Faixas",
    feed_tab_vinyls: "Vinis e Vitrines",
    feed_tab_rigid: "Placas Rígidas e PVC",
    feed_tab_illuminated: "Backlight Luminosos",
    btn_use_prompt: "Usar no Criador de Pôster",
    btn_copy_prompt: "Copiar Prompt",
    btn_prompt_copied: "Copiado!",
    sim_title: "Simulador de Medidas e Custo Estimado",
    sim_subtitle: "Ajuste os controles para visualizar as dimensões reais em escala e calcular seu investimento na hora.",
    sim_material_label: "Material Selecionado",
    sim_width_label: "Largura",
    sim_height_label: "Altura",
    sim_total_surface: "Área Total",
    sim_btn_quote: "Orçar este trabalho sob medida",
    categories_section_title: "Substratos Técnicos de Impressão",
    categories_section_subtitle: "Lonas, Vinis, Rígidos e Sistemas de Exibição produzidos com tintas UV e ecossolventes de alta resistência.",
    solutions_section_title: "Soluções por Segmento",
    solutions_section_subtitle: "Materiais recomendados de acordo com o local de instalação e durabilidade necessária.",
    why_us_title: "Por que escolher a Carteles.Click?",
    why_us_subtitle: "Tecnologia de ponta, prazos recordes e transparência total em preços de fábrica.",
    b2b_badge: "Venda Corporativa e B2B",
    view_all_materials: "Ver Catálogo Completo",
  },
};


