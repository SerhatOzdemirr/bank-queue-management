using BankNumerator.Api.Models;
public class Agent
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public ICollection<AgentSkill> Skills { get; set; } = new List<AgentSkill>();
    public ICollection<TicketAssignment> Assignments { get; set; } = new List<TicketAssignment>();
}