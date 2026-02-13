-- ============================================
-- SGHSS - Sistema de Gestão Hospitalar e de Serviços de Saúde
-- Script de Criação do Banco de Dados
-- Database: PostgreSQL 14+
-- Projeto: Multidisciplinar UNINTER 2026
-- Aluno: Vinícius Pereira Capacci - RU: 4389297
-- ============================================

-- EXTENSÃO PARA UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: USUARIO
-- Armazena todos os usuários do sistema
-- ============================================
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('PACIENTE', 'PROFISSIONAL', 'ADMIN')) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE usuario IS 'Armazena todos os usuários do sistema (pacientes, profissionais e administradores)';
COMMENT ON COLUMN usuario.tipo IS 'Tipo de usuário: PACIENTE, PROFISSIONAL ou ADMIN';
COMMENT ON COLUMN usuario.senha_hash IS 'Senha criptografada com bcrypt (salt rounds: 10)';

-- ============================================
-- TABELA: PACIENTE
-- Dados específicos de pacientes
-- ============================================
CREATE TABLE paciente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    cpf_encrypted VARCHAR(512) UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    tipo_sanguineo VARCHAR(10),
    alergias TEXT,
    telefone VARCHAR(20),
    endereco JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE paciente IS 'Dados específicos de pacientes vinculados a usuários';
COMMENT ON COLUMN paciente.cpf_encrypted IS 'CPF criptografado com AES-256-CBC (LGPD)';
COMMENT ON COLUMN paciente.endereco IS 'JSON: {rua, numero, complemento, bairro, cidade, estado, cep}';

-- ============================================
-- TABELA: PROFISSIONAL
-- Dados específicos de profissionais de saúde
-- ============================================
CREATE TABLE profissional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    crm_crn VARCHAR(50) UNIQUE NOT NULL,
    especialidade VARCHAR(100) NOT NULL,
    disponibilidade JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE profissional IS 'Dados específicos de profissionais de saúde (médicos, enfermeiros, etc)';
COMMENT ON COLUMN profissional.crm_crn IS 'Registro profissional (CRM para médicos, COREN para enfermeiros, etc)';
COMMENT ON COLUMN profissional.disponibilidade IS 'JSON com horários disponíveis por dia da semana';

-- ============================================
-- TABELA: CONSULTA
-- Agendamentos e consultas realizadas
-- ============================================
CREATE TABLE consulta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE RESTRICT,
    profissional_id UUID NOT NULL REFERENCES profissional(id) ON DELETE RESTRICT,
    data_hora TIMESTAMP NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('PRESENCIAL', 'TELEMEDICINA')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('AGENDADA', 'REALIZADA', 'CANCELADA')) DEFAULT 'AGENDADA',
    motivo VARCHAR(500),
    observacoes TEXT,
    motivo_cancelamento TEXT,
    cancelada_em TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_data_futura CHECK (data_hora > CURRENT_TIMESTAMP)
);

COMMENT ON TABLE consulta IS 'Agendamentos de consultas (presenciais ou telemedicina)';
COMMENT ON COLUMN consulta.tipo IS 'PRESENCIAL ou TELEMEDICINA';
COMMENT ON COLUMN consulta.status IS 'AGENDADA, REALIZADA ou CANCELADA';

-- ============================================
-- TABELA: PRONTUARIO
-- Registro clínico das consultas
-- ============================================
CREATE TABLE prontuario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consulta_id UUID NOT NULL REFERENCES consulta(id) ON DELETE RESTRICT,
    profissional_id UUID NOT NULL REFERENCES profissional(id) ON DELETE RESTRICT,
    data_atendimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    queixa_principal TEXT,
    historia_doenca_atual TEXT,
    exame_fisico TEXT,
    hipotese_diagnostica TEXT,
    diagnostico TEXT,
    conduta TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE prontuario IS 'Prontuário eletrônico - registro clínico detalhado da consulta';
COMMENT ON COLUMN prontuario.queixa_principal IS 'Motivo principal da consulta relatado pelo paciente';
COMMENT ON COLUMN prontuario.conduta IS 'Plano terapêutico definido pelo profissional';

-- ============================================
-- TABELA: PRESCRICAO
-- Prescrições médicas vinculadas a prontuários
-- ============================================
CREATE TABLE prescricao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prontuario_id UUID NOT NULL REFERENCES prontuario(id) ON DELETE CASCADE,
    medicamento VARCHAR(255) NOT NULL,
    dosagem VARCHAR(100) NOT NULL,
    via_administracao VARCHAR(50),
    frequencia VARCHAR(100) NOT NULL,
    duracao VARCHAR(100),
    instrucoes_uso TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE prescricao IS 'Prescrições médicas digitais vinculadas a prontuários';
COMMENT ON COLUMN prescricao.via_administracao IS 'Oral, injetável, tópica, etc';
COMMENT ON COLUMN prescricao.frequencia IS 'Ex: 8/8h, 12/12h, 1x ao dia';

-- ============================================
-- TABELA: NOTIFICACAO
-- Notificações enviadas aos pacientes
-- ============================================
CREATE TABLE notificacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paciente_id UUID NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    tipo VARCHAR(20) CHECK (tipo IN ('EMAIL', 'SMS', 'PUSH')) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN DEFAULT false,
    enviada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lida_em TIMESTAMP
);

COMMENT ON TABLE notificacao IS 'Notificações e lembretes enviados aos pacientes';
COMMENT ON COLUMN notificacao.tipo IS 'Canal de envio: EMAIL, SMS ou PUSH (app mobile)';

-- ============================================
-- TABELA: AUDITORIA
-- Registro de auditoria LGPD
-- ============================================
CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(100) NOT NULL,
    entidade_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_origem VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE auditoria IS 'Registro de auditoria de todas as operações sensíveis (conformidade LGPD)';
COMMENT ON COLUMN auditoria.acao IS 'CREATE, UPDATE, DELETE, READ_SENSITIVE';
COMMENT ON COLUMN auditoria.entidade IS 'Nome da tabela afetada';
COMMENT ON COLUMN auditoria.dados_anteriores IS 'Estado anterior dos dados (para UPDATE/DELETE)';
COMMENT ON COLUMN auditoria.dados_novos IS 'Novo estado dos dados (para CREATE/UPDATE)';

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices de consulta (otimização de queries frequentes)
CREATE INDEX idx_consulta_paciente ON consulta(paciente_id);
CREATE INDEX idx_consulta_profissional ON consulta(profissional_id);
CREATE INDEX idx_consulta_data_hora ON consulta(data_hora);
CREATE INDEX idx_consulta_status ON consulta(status);
CREATE INDEX idx_consulta_data_hora_status ON consulta(data_hora, status); -- índice composto

-- Índices de busca rápida
CREATE INDEX idx_paciente_cpf ON paciente(cpf_encrypted);
CREATE INDEX idx_paciente_nome ON paciente(nome_completo);
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_profissional_crm ON profissional(crm_crn);

-- Índices de auditoria
CREATE INDEX idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX idx_auditoria_timestamp ON auditoria(timestamp);
CREATE INDEX idx_auditoria_entidade ON auditoria(entidade);
CREATE INDEX idx_auditoria_entidade_id ON auditoria(entidade_id);

-- Índices de relacionamentos
CREATE INDEX idx_prontuario_consulta ON prontuario(consulta_id);
CREATE INDEX idx_prescricao_prontuario ON prescricao(prontuario_id);
CREATE INDEX idx_notificacao_paciente ON notificacao(paciente_id);
CREATE INDEX idx_notificacao_lida ON notificacao(lida);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuario_updated_at BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_paciente_updated_at BEFORE UPDATE ON paciente
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profissional_updated_at BEFORE UPDATE ON profissional
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consulta_updated_at BEFORE UPDATE ON consulta
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prontuario_updated_at BEFORE UPDATE ON prontuario
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS DE EXEMPLO (SEED) - OPCIONAL
-- ============================================

-- Usuário Administrador
INSERT INTO usuario (email, senha_hash, tipo) VALUES 
('admin@vidaplus.com', '$2b$10$examplehashedpassword123456789', 'ADMIN');

-- Profissional de Saúde (Médico)
INSERT INTO usuario (email, senha_hash, tipo) VALUES 
('dr.silva@vidaplus.com', '$2b$10$examplehashedpassword123456789', 'PROFISSIONAL');

INSERT INTO profissional (usuario_id, crm_crn, especialidade, disponibilidade) 
SELECT id, 'CRM/SP 123456', 'Cardiologia', 
'{"segunda": ["08:00-12:00", "14:00-18:00"], "quarta": ["08:00-12:00"]}'::jsonb
FROM usuario WHERE email = 'dr.silva@vidaplus.com';

-- Paciente
INSERT INTO usuario (email, senha_hash, tipo) VALUES 
('paciente@email.com', '$2b$10$examplehashedpassword123456789', 'PACIENTE');

INSERT INTO paciente (usuario_id, cpf_encrypted, nome_completo, data_nascimento, tipo_sanguineo, telefone, endereco)
SELECT id, 'encrypted_cpf_here', 'João da Silva', '1960-05-15', 'O+', '(11) 98765-4321',
'{"rua": "Rua das Flores", "numero": "123", "bairro": "Centro", "cidade": "São Paulo", "estado": "SP", "cep": "01234-567"}'::jsonb
FROM usuario WHERE email = 'paciente@email.com';

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar todas as tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar índices criados
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
