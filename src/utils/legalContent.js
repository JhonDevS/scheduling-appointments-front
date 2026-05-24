export const LEGAL_PAGES = {
  privacy: {
    title: 'Política de privacidad',
    sections: [
      {
        heading: 'Datos que recopilamos',
        body: 'Recopilamos información de identificación, contacto y datos clínicos necesarios para gestionar citas y su historial de salud.',
      },
      {
        heading: 'Uso de la información',
        body: 'Utilizamos sus datos únicamente para coordinar atención médica, recordatorios y mejoras del servicio SaludYa.',
      },
    ],
  },
  terms: {
    title: 'Términos de servicio',
    sections: [
      {
        heading: 'Uso de la plataforma',
        body: 'Al utilizar SaludYa acepta usar la plataforma de forma responsable y conforme a la normativa sanitaria vigente.',
      },
      {
        heading: 'Responsabilidades',
        body: 'SaludYa facilita la gestión de citas; la atención clínica es responsabilidad del profesional tratante.',
      },
    ],
  },
  contact: {
    title: 'Contáctenos',
    sections: [
      {
        heading: 'Atención al paciente',
        body: 'Escríbanos a soporte@saludya.com o llame al +57 (1) 800 123 456, lunes a viernes de 8:00 a 18:00.',
      },
    ],
  },
  support: {
    title: 'Soporte',
    sections: [
      {
        heading: 'Centro de ayuda',
        body: 'Consulte preguntas frecuentes sobre reservas, cancelaciones y acceso a su panel de paciente.',
      },
      {
        heading: 'Incidencias técnicas',
        body: 'Reporte errores de la aplicación indicando su correo registrado y una descripción del problema.',
      },
    ],
  },
  security: {
    title: 'Estándares de seguridad',
    sections: [
      {
        heading: 'Protección de datos',
        body: 'Aplicamos cifrado en tránsito, controles de acceso por rol y auditoría de sesiones.',
      },
    ],
  },
  compliance: {
    title: 'Cumplimiento',
    sections: [
      {
        heading: 'Normativa aplicable',
        body: 'Operamos alineados con buenas prácticas de protección de datos de salud y consentimiento informado.',
      },
    ],
  },
  portability: {
    title: 'Portabilidad de datos',
    sections: [
      {
        heading: 'Exportación',
        body: 'Puede solicitar una copia de su información en formato electrónico desde su perfil o soporte.',
      },
    ],
  },
}

export function getLegalPage(slug) {
  return LEGAL_PAGES[slug] ?? null
}

export const LEGAL_SLUGS = Object.keys(LEGAL_PAGES)
