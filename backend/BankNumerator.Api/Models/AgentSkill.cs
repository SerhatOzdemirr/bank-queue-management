public class AgentSkill
{
  public int AgentId     { get; set; }
  public Agent Agent     { get; set; } = null!;
  public string ServiceKey { get; set; } = null!;
}