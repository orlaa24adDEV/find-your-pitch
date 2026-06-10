import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fields = [
  {
    name: "Campo de Fútbol San Ignacio (El Palo)",
    description: "Histórico campo del barrio marítimo adaptado para fútbol 7 y fútbol 11. Cuenta con césped artificial de alta resistencia, excelente iluminación nocturna y un gran ambiente deportivo local.",
    location: "Calle San Ignacio, 1, Málaga",
    sport: "Fútbol",
    priceHour: 35.00,
  },
  {
    name: "Campo de Fútbol Romualdo Fernández (Ciudad Jardín)",
    description: "Excelente terreno de juego optimizado para partidos rápidos de fútbol 7. Césped artificial bien mantenido, vestuarios renovados y fácil acceso en una zona emblemática.",
    location: "Avenida de Santiago Ramón y Cajal, 84, Málaga",
    sport: "Fútbol",
    priceHour: 30.00,
  },
  {
    name: "Campo Municipal Mortadelo (Cruz de Humilladero)",
    description: "Instalación de referencia en el distrito para fútbol 11. Dispone de un césped sintético de última generación, gradas cubiertas, cantina y modernos sistemas de iluminación LED.",
    location: "Calle Eslava, 14, Málaga",
    sport: "Fútbol",
    priceHour: 45.00,
  },
  {
    name: "Campo de Fútbol Portada Alta",
    description: "Complejo deportivo versátil que alberga campos reglamentarios de fútbol 11 y fútbol 7. Perfecto para ligas locales, cuenta con vestuarios amplios y zonas de aparcamiento en los alrededores.",
    location: "Calle Cómpeta, 22, Málaga",
    sport: "Fútbol",
    priceHour: 40.00,
  },
  {
    name: "Polideportivo El Cónsul (Teatinos)",
    description: "Ubicado en plena zona universitaria, es un campo ideal para fútbol 7. Césped artificial en perfectas condiciones, iluminación de alta intensidad y un entorno moderno.",
    location: "Calle Profesor García Duarte, 5, Málaga",
    sport: "Fútbol",
    priceHour: 35.00,
  },
  {
    name: "Campo de Fútbol Guadaljaire",
    description: "Espacio deportivo muy activo en el barrio enfocado en fútbol 7. Cuenta con césped artificial bien amortiguado, dimensiones óptimas y un servicio excelente de reserva y atención.",
    location: "Calle Estepona, 4, Málaga",
    sport: "Fútbol",
    priceHour: 30.00,
  },
  {
    name: "Campo de Fútbol Roma Luz (La Luz)",
    description: "Campo completo de fútbol 11 situado en el corazón de Carretera de Cádiz. Instalaciones con césped de calidad, bar-cafetería para el post-partido y gradas con buena visibilidad.",
    location: "Avenida de Velázquez, 72, Málaga",
    sport: "Fútbol",
    priceHour: 45.00,
  },
  {
    name: "Centro Deportivo Puerto de la Torre",
    description: "Moderno recinto que ofrece versatilidad con trazados para fútbol 11 y fútbol 7. Destaca por la calidad de sus vestuarios, iluminación de última generación y facilidad de estacionamiento.",
    location: "Calle Lope de Vega, 40, Málaga",
    sport: "Fútbol",
    priceHour: 40.00,
  },
  {
    name: "Campo Municipal Las Virreinas",
    description: "Instalación deportiva de barrio ideal para encuentros de fútbol 7. Césped sintético confortable, ambiente familiar, vestuarios limpios y tarifas muy accesibles.",
    location: "Calle Jane Bowles, 11, Málaga",
    sport: "Fútbol",
    priceHour: 30.00,
  },
  {
    name: "Campo de Fútbol Carlinda",
    description: "Gran terreno de juego para fútbol 11 en la zona norte de la ciudad. Césped artificial de buen agarre, iluminación óptima para partidos nocturnos y zona de grada para espectadores.",
    location: "Calle Granja Suárez, 2, Málaga",
    sport: "Fútbol",
    priceHour: 45.00,
  },
  {
    name: "Campo de Fútbol Tiro Pichón",
    description: "Uno de los complejos con más solera de Málaga, preparado para fútbol 11 y fútbol 7. Cuenta con césped renovado, múltiples vestuarios colectivos y una excelente ubicación.",
    location: "Avenida de Manuel Gorría, 31, Málaga",
    sport: "Fútbol",
    priceHour: 42.00,
  },
  {
    name: "Campo Municipal San Julián",
    description: "Tranquilo campo de fútbol 7 cerca de la zona litoral y del polígono. Dispone de césped artificial mullido, iluminación LED y aparcamiento cómodo y gratuito junto a la entrada.",
    location: "Camino de los Prados, 55, Málaga",
    sport: "Fútbol",
    priceHour: 32.00,
  },
  {
    name: "Campo de Fútbol Churriana",
    description: "Campo de fútbol 11 de dimensiones reglamentarias situado en el distrito de Churriana. Buenas condiciones del césped artificial, zona de bar y amplios vestuarios para los equipos.",
    location: "Calle Camino del Retiro, 8, Málaga",
    sport: "Fútbol",
    priceHour: 45.00,
  },
  {
    name: "Campo de Fútbol Campanillas",
    description: "Espacio deportivo idóneo para partidos de fútbol 7 en un entorno tranquilo. Cuenta con terreno sintético cuidado, buena iluminación perimetral y facilidades de reserva.",
    location: "Calle José Calderón, 42, Málaga",
    sport: "Fútbol",
    priceHour: 30.00,
  },
  {
    name: "Polideportivo Ciudad de Málaga",
    description: "Instalación de calidad premium con campo de fútbol 11 de césped natural. Utilizado para entrenamientos de alto rendimiento y partidos principales. Cuenta con vestuarios profesionales e iluminación de estadio.",
    location: "Avenida de Manuel Alvar, 2, Málaga",
    sport: "Fútbol",
    priceHour: 60.00,
  },
  {
    name: "Campo de Fútbol Intelhorce",
    description: "Terreno de juego para fútbol 7 situado en el distrito industrial. Ofrece un césped sintético robusto, iluminación potente para las horas de tarde-noche y un ambiente de juego muy competitivo.",
    location: "Calle Intelhorce, 15, Málaga",
    sport: "Fútbol",
    priceHour: 30.00,
  },
  {
    name: "Campo Municipal Nuevo San Andrés",
    description: "Gran recinto para la práctica de fútbol 11 en un barrio de gran tradición futbolística. Césped artificial en excelente estado, gradas bien distribuidas, vestuarios cómodos y cafetería.",
    location: "Calle Eduardo Carvajal, 6, Málaga",
    sport: "Fútbol",
    priceHour: 45.00,
  },
  {
    name: "Campo de Fútbol La Unidad (Nueva Málaga)",
    description: "Muy popular en el distrito de Bailén-Miraflores para fútbol 7. Césped artificial de rendimiento óptimo, iluminación LED impecable y cantina muy frecuentada por los jugadores locales.",
    location: "Calle Santa Rosa de Lima, 9, Málaga",
    sport: "Fútbol",
    priceHour: 35.00,
  },
  {
    name: "Campo de Fútbol Los Corazones",
    description: "Acogedor campo de fútbol 7 perfecto para pachangas entre amigos o torneos relámpago. Su césped absorbe bien los impactos, la iluminación es uniforme y se encuentra bien conectado.",
    location: "Calle Corazones, 3, Málaga",
    sport: "Fútbol",
    priceHour: 35.00,
  },
  {
    name: "Campo de Fútbol El Torcal",
    description: "Complejo de fútbol 11 icónico en la zona oeste de Málaga. Ofrece un terreno de césped sintético de gran amortiguación, vestuarios amplios, gradas para público e iluminación de alta calidad.",
    location: "Calle Cádiz, 25, Málaga",
    sport: "Fútbol",
    priceHour: 45.00,
  },
];

async function main() {
  console.log("Limpiando campos existentes...");
  await prisma.booking.deleteMany();
  await prisma.field.deleteMany();

  console.log("Insertando 20 campos de Málaga...");
  for (const field of fields) {
    await prisma.field.create({ data: field });
  }

  console.log("✅ 20 campos creados correctamente");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
