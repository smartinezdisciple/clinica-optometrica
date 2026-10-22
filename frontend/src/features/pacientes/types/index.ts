export interface Paciente {
  id_cliente: number
  cedula: string | null
  nombres: string
  apellidos: string
  tipo_cliente: 'Persona'
  numero_telefono: string
  correo: string | null
  fecha_registro: string
  ocupacion: string | null
  fecha_nacimiento: string
  genero: 'Masculino' | 'Femenino' | 'Otro' | null
  id_empresa: number | null
}

export interface Empresa {
  id_cliente: number
  cedula: string | null
  nombres: string
  apellidos: string
  tipo_cliente: 'Empresa'
  numero_telefono: string
  correo: string | null
  fecha_registro: string
  razon_social: string
  ruc: string
}

export interface PacienteFormInput {
  cedula?: string
  nombres: string
  apellidos: string
  numero_telefono: string
  correo?: string
  ocupacion?: string
  fecha_nacimiento: string
  genero?: 'Masculino' | 'Femenino' | 'Otro'
  id_empresa?: number | null
}

export interface EmpresaFormInput {
  cedula?: string
  nombres: string
  apellidos: string
  numero_telefono: string
  correo?: string
  razon_social: string
  ruc: string
}
