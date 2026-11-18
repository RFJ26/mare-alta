import { describe, it, expect } from 'vitest';
import { formatarMensagem, urlWhatsApp } from '../js/reservas.js';

const base = {
  nome: 'Ana Sousa',
  data: '2026-11-21',
  hora: '20:30',
  pessoas: '4',
  observacoes: 'Uma pessoa alérgica a crustáceos',
};
const contexto = { restaurante: 'Maré Alta', idioma: 'pt' };

describe('formatarMensagem (WhatsApp)', () => {
  it('formata todos os campos, com a data por extenso em português', () => {
    expect(formatarMensagem(base, contexto)).toBe(
      [
        '*Pedido de reserva · Maré Alta*',
        '',
        '*Nome:* Ana Sousa',
        '*Data:* sábado, 21 de novembro',
        '*Hora:* 20:30',
        '*Pessoas:* 4',
        '*Observações:* Uma pessoa alérgica a crustáceos',
        '*Idioma do cliente:* Português',
      ].join('\n'),
    );
  });

  it('omite a linha das observações quando estão vazias', () => {
    const msg = formatarMensagem({ ...base, observacoes: '   ' }, contexto);
    expect(msg).not.toContain('Observações');
  });

  it('mantém a mensagem em português e indica o idioma do cliente', () => {
    const msg = formatarMensagem(base, { ...contexto, idioma: 'en' });
    expect(msg).toContain('*Data:* sábado, 21 de novembro');
    expect(msg.split('\n').at(-1)).toBe('*Idioma do cliente:* Inglês');
    expect(formatarMensagem(base, { ...contexto, idioma: 'es' })).toContain('Espanhol');
  });

  it('remove espaços a mais no nome', () => {
    expect(formatarMensagem({ ...base, nome: '  Ana  ' }, contexto)).toContain('*Nome:* Ana\n');
  });

  it('a data não depende do fuso do dispositivo (1 de janeiro continua a ser 1 de janeiro)', () => {
    expect(formatarMensagem({ ...base, data: '2027-01-01' }, contexto)).toContain('sexta-feira, 1 de janeiro');
  });
});

describe('urlWhatsApp', () => {
  it('gera um link wa.me com a mensagem codificada', () => {
    const url = urlWhatsApp('351000000000', 'Olá!\nMesa às 20:30 & 4 pessoas');
    expect(url).toBe('https://wa.me/351000000000?text=Ol%C3%A1!%0AMesa%20%C3%A0s%2020%3A30%20%26%204%20pessoas');
    expect(decodeURIComponent(new URL(url).searchParams.get('text'))).toBe('Olá!\nMesa às 20:30 & 4 pessoas');
  });

  it('aceita o número com espaços ou "+" e fica só com os dígitos', () => {
    expect(urlWhatsApp('+351 289 000 000', 'x')).toBe('https://wa.me/351289000000?text=x');
  });
});
