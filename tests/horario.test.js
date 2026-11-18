import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { estadoAtual, agoraEmLisboa, horasDisponiveis } from '../js/horario.js';

const info = JSON.parse(readFileSync(new URL('../data/info.json', import.meta.url), 'utf8'));
const { horario } = info;

// Dias: 0 = domingo, 1 = segunda (folga), 2 = terça ... 5 = sexta, 6 = sábado
const em = (dia, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return { dia, minutos: h * 60 + m };
};

describe('estadoAtual ("Aberto agora / Fechado")', () => {
  it('está aberto durante o turno do almoço', () => {
    expect(estadoAtual(horario, em(2, '13:00'))).toEqual({ aberto: true, fechaAs: '15:30' });
  });

  it('abre à hora exata e fecha à hora exata', () => {
    expect(estadoAtual(horario, em(2, '12:00')).aberto).toBe(true);
    expect(estadoAtual(horario, em(2, '15:30')).aberto).toBe(false);
  });

  it('entre turnos diz a que horas reabre no mesmo dia', () => {
    expect(estadoAtual(horario, em(2, '16:00'))).toEqual({
      aberto: false,
      abre: { emDias: 0, hora: '19:00', dia: 2 },
    });
  });

  it('continua aberto depois da meia-noite no turno de sexta', () => {
    // Sábado às 00:15 ainda pertence ao turno de sexta (19:00–00:30)
    expect(estadoAtual(horario, em(6, '00:15'))).toEqual({ aberto: true, fechaAs: '00:30' });
  });

  it('fecha às 00:30 e reabre no sábado ao almoço', () => {
    expect(estadoAtual(horario, em(6, '00:45'))).toEqual({
      aberto: false,
      abre: { emDias: 0, hora: '12:00', dia: 6 },
    });
  });

  it('à segunda-feira (folga) aponta para terça às 12:00', () => {
    expect(estadoAtual(horario, em(1, '13:00'))).toEqual({
      aberto: false,
      abre: { emDias: 1, hora: '12:00', dia: 2 },
    });
  });

  it('domingo à noite, depois de fechar, salta a segunda e aponta para terça', () => {
    expect(estadoAtual(horario, em(0, '23:00')).abre).toEqual({ emDias: 2, hora: '12:00', dia: 2 });
  });

  it('com o restaurante sempre fechado não inventa uma abertura', () => {
    expect(estadoAtual({}, em(3, '12:00'))).toEqual({ aberto: false, abre: null });
  });
});

describe('agoraEmLisboa (fuso Europe/Lisbon)', () => {
  it('no inverno Lisboa está em UTC+0', () => {
    expect(agoraEmLisboa('Europe/Lisbon', new Date('2026-01-14T20:30:00Z'))).toEqual({
      data: '2026-01-14', dia: 3, minutos: 20 * 60 + 30,
    });
  });

  it('no verão Lisboa está em UTC+1 e pode já ser o dia seguinte', () => {
    // 23:30 UTC de 1 de julho são 00:30 de 2 de julho em Lisboa
    expect(agoraEmLisboa('Europe/Lisbon', new Date('2026-07-01T23:30:00Z'))).toEqual({
      data: '2026-07-02', dia: 4, minutos: 30,
    });
  });

  it('um turista em Nova Iorque vê o estado de Lisboa, não o da sua hora local', () => {
    // Sexta, 20 de novembro, 22:00 em Nova Iorque = sábado 03:00 em Lisboa: fechado
    const agora = agoraEmLisboa('Europe/Lisbon', new Date('2026-11-21T03:00:00Z'));
    expect(agora.dia).toBe(6);
    expect(estadoAtual(horario, agora).aberto).toBe(false);
  });
});

describe('horasDisponiveis (reservas)', () => {
  const amanhaDeQuarta = { data: '2026-11-18', minutos: 0 };

  it('dá horas de 30 em 30 minutos até 1 hora antes de fechar', () => {
    const horas = horasDisponiveis(info, '2026-11-19', amanhaDeQuarta); // quinta
    expect(horas[0]).toBe('12:00');
    expect(horas).toContain('14:30');
    expect(horas).not.toContain('15:00');
    expect(horas.at(-1)).toBe('22:00');
  });

  it('não dá horas à segunda-feira', () => {
    expect(horasDisponiveis(info, '2026-11-23', amanhaDeQuarta)).toEqual([]);
  });

  it('hoje só a partir de agora + 1 hora de antecedência', () => {
    const horas = horasDisponiveis(info, '2026-11-18', { data: '2026-11-18', minutos: 18 * 60 + 10 });
    expect(horas[0]).toBe('19:30');
  });
});
