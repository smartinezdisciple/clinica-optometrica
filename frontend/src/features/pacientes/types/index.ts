export interface Paciente {
  id_cliente: number
  cedula: string | null
  primer_nombre: string
  segundo_nombre: string | null
  primer_apellido: string
  segundo_apellido: string | null
  tipo_cliente: 'Persona'
  numero_telefono: string
  correo: string | null
  fecha_registro: string
  ocupacion: string | null
  fecha_nacimiento: string
  genero: 'Masculino' | 'Femenino' | 'Otro' | null
}

export interface Empresa {
  id_cliente: number
  cedula: string | null
  primer_nombre: string
  segundo_nombre: string | null
  primer_apellido: string
  segundo_apellido: string | null
  tipo_cliente: 'Empresa'
  numero_telefono: string
  correo: string | null
  fecha_registro: string
  razon_social: string
  ruc: string
}

export interface PacienteFormInput {
  cedula?: string
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  numero_telefono: string
  correo?: string
  ocupacion?: string
  fecha_nacimiento: string
  genero?: 'Masculino' | 'Femenino' | 'Otro'
}

export interface EmpresaFormInput {
  cedula?: string
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  numero_telefono: string
  correo?: string
  razon_social: string
  ruc: string
}
