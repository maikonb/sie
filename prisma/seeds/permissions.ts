import { Permission, PrismaClient, Role } from "@prisma/client"

export async function seedPermissions(prisma: PrismaClient) {
  console.log("Seeding Permissions...")
  const permissions = [
    { slug: "projects.view", name: "Visualizar Projetos", description: "Pode visualizar projetos" },
    { slug: "projects.create", name: "Criar Projetos", description: "Pode criar projetos" },
    { slug: "projects.edit", name: "Editar Projetos", description: "Pode editar projetos" },
    { slug: "projects.delete", name: "Excluir Projetos", description: "Pode excluir projetos" },
    { slug: "projects.approve", name: "Aprovar/Reprovar Projetos", description: "Pode aprovar ou reprovar projetos submetidos" },
    { slug: "legal_instruments.manage", name: "Gerenciar Instrumentos Legais", description: "Pode alterar o arquivo vinculado a um instrumento legal" },
    { slug: "users.manage", name: "Gerenciar Usuários", description: "Pode gerenciar contas de usuários e atribuir papéis" },
  ]

  const roles = [
    { slug: "user", name: "Usuário", description: "Usuário comum da aplicação" },
    { slug: "project_admin", name: "Aprovador de Projetos", description: "Pode rever e aprovar projetos" },
    { slug: "admin", name: "Administrador", description: "Acesso total" },
  ]

  // Helpers to find-or-create (idempotent-ish)
  const getOrCreatePermission = async (p: { slug: string; name: string; description?: string }) => {
    let perm = await prisma.permission.findFirst({ where: { slug: p.slug } })
    if (!perm) {
      perm = await prisma.permission.create({ data: { name: p.name, description: p.description || null, slug: p.slug } })
    }
    return perm as Permission
  }

  const getOrCreateRole = async (r: { slug: string; name: string; description?: string }) => {
    let role = await prisma.role.findFirst({ where: { slug: r.slug } })
    if (!role) {
      role = await prisma.role.create({ data: { name: r.name, description: r.description || null, slug: r.slug } })
    }
    return role as Role
  }

  const createdPermissions: Record<string, Permission> = {}
  for (const p of permissions) {
    const perm = await getOrCreatePermission(p)
    createdPermissions[p.slug] = perm
  }

  const createdRoles: Record<string, Role> = {}
  for (const r of roles) {
    const role = await getOrCreateRole(r)
    createdRoles[r.slug] = role
  }

  const rolePermissionMap: Record<string, string[]> = {
    user: ["projects.view", "projects.create", "projects.edit"],
    project_admin: ["projects.view", "projects.approve", "legal_instruments.manage"],
    admin: permissions.map((p) => p.slug),
  }

  for (const [roleSlug, permSlugs] of Object.entries(rolePermissionMap)) {
    const role = createdRoles[roleSlug]
    if (!role) continue

    for (const permSlug of permSlugs) {
      const perm = createdPermissions[permSlug]
      if (!perm) continue

      const exists = await prisma.rolePermission.findFirst({ where: { roleId: role.id, permissionId: perm.id } })
      if (!exists) {
        await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: perm.id } })
      }
    }
  }
}
