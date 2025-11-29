export async function submitToSie(projectData: any, classification: string): Promise<any> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock response
  return {
    success: true,
    sieId: `SIE-${Math.floor(Math.random() * 10000)}`,
    classification,
    message: "Projeto pré-aprovado no SIE para prosseguimento jurídico.",
  }
}
