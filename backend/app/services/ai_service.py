"""
AI Service
Handles all AI/LLM integrations (OpenAI, etc.)
"""
import os
from typing import Optional, Dict, List
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIService:
    """Service for AI/LLM operations"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        api_key = os.getenv('OPENAI_API_KEY')
        
        if not api_key:
            print("⚠️  WARNING: OPENAI_API_KEY not found in environment variables")
            print("   Icebreaker generation will not work without an API key")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)
            print("✅ OpenAI client initialized successfully")
    
    def _build_icebreaker_prompt(
        self, 
        sender_profile: Dict, 
        recipient_profile: Dict
    ) -> str:
        """
        Build a personalized prompt for icebreaker generation
        
        Args:
            sender_profile: Profile of the user sending the icebreaker
            recipient_profile: Profile of the user receiving the icebreaker
            
        Returns:
            Formatted prompt string
        """
        # Extract relevant information from profiles (new flat structure)
        sender_name = sender_profile.get('name', 'User')
        recipient_name = recipient_profile.get('name', 'the match')
        
        # Get interests from interest_tags (comma-separated string)
        recipient_interest_tags = recipient_profile.get('interest_tags', '')
        recipient_interests = [tag.strip() for tag in recipient_interest_tags.split(',') if tag.strip()]
        
        sender_interest_tags = sender_profile.get('interest_tags', '')
        sender_interests = [tag.strip() for tag in sender_interest_tags.split(',') if tag.strip()]
        
        # Get other profile info
        recipient_location = recipient_profile.get('location', '')
        recipient_age = recipient_profile.get('age', '')
        
        # Build interests string
        interests_str = ', '.join(recipient_interests) if recipient_interests else 'various activities'
        sender_interests_str = ', '.join(sender_interests) if sender_interests else 'various activities'
        
        # Common interests
        common_interests = list(set(sender_interests) & set(recipient_interests))
        common_str = ', '.join(common_interests) if common_interests else None
        
        prompt = f"""You are a dating conversation expert helping {sender_name} start a conversation with {recipient_name}.

RECIPIENT'S PROFILE:
- Name: {recipient_name}
- Interests: {interests_str}
{f'- Location: {recipient_location}' if recipient_location else ''}
{f'- Age: {recipient_age}' if recipient_age else ''}

SENDER'S INTERESTS: {sender_interests_str}
{f'COMMON INTERESTS: {common_str}' if common_str else ''}

Generate a creative, personalized icebreaker message that:
1. References specific interests or bio details from the recipient's profile
2. Is warm, genuine, and not overly formal or cheesy
3. Asks an open-ended question that encourages a thoughtful response
4. Is 2-3 sentences maximum (keep it concise)
5. Sounds natural and conversational, not like a template
6. Shows genuine interest in getting to know them
{f'7. Incorporates the common interest in {common_str} if possible' if common_str else ''}

IMPORTANT: Do NOT use generic openers like "Hey, how are you?" or "What's up?"
The icebreaker should feel personalized and show that {sender_name} actually read the profile.

Generate ONLY the icebreaker message text (no quotes, no preamble, just the message):"""
        
        return prompt
    
    async def generate_icebreaker(
        self, 
        sender_profile: Dict, 
        recipient_profile: Dict,
        temperature: float = 0.8
    ) -> Optional[str]:
        """
        Generate a personalized icebreaker message using AI
        
        Args:
            sender_profile: Profile of the user sending the message
            recipient_profile: Profile of the user receiving the message
            temperature: Creativity level (0.0-2.0, higher = more creative)
            
        Returns:
            Generated icebreaker text or None if generation fails
        """
        if not self.client:
            print("Error: OpenAI client not initialized")
            return self._generate_fallback_icebreaker(sender_profile, recipient_profile)
        
        try:
            # Build the prompt
            prompt = self._build_icebreaker_prompt(sender_profile, recipient_profile)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Fast and cost-effective for hackathon
                messages=[
                    {
                        "role": "system",
                        "content": "You are a dating conversation expert who writes natural, engaging icebreaker messages."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=temperature,
                max_tokens=150,  # Keep responses concise
                top_p=1.0,
                frequency_penalty=0.3,  # Reduce repetitive phrases
                presence_penalty=0.3    # Encourage diverse topics
            )
            
            # Extract the generated text
            icebreaker = response.choices[0].message.content.strip()
            
            # Clean up any quotes that might have been added
            icebreaker = icebreaker.strip('"').strip("'")
            
            return icebreaker
            
        except Exception as e:
            print(f"Error generating icebreaker with AI: {str(e)}")
            return self._generate_fallback_icebreaker(sender_profile, recipient_profile)
    
    def _generate_fallback_icebreaker(
        self, 
        sender_profile: Dict, 
        recipient_profile: Dict
    ) -> str:
        """
        Generate a simple fallback icebreaker without AI
        Used when OpenAI API is unavailable
        
        Args:
            sender_profile: Profile of the user sending the message
            recipient_profile: Profile of the user receiving the message
            
        Returns:
            Simple icebreaker message
        """
        recipient_name = recipient_profile.get('name', 'there')
        
        # Parse interest tags
        recipient_interest_tags = recipient_profile.get('interest_tags', '')
        recipient_interests = [tag.strip() for tag in recipient_interest_tags.split(',') if tag.strip()]
        
        sender_interest_tags = sender_profile.get('interest_tags', '')
        sender_interests = [tag.strip() for tag in sender_interest_tags.split(',') if tag.strip()]
        
        # Find common interests
        common_interests = list(set(sender_interests) & set(recipient_interests))
        
        if common_interests:
            interest = common_interests[0]
            return f"Hey {recipient_name}! I noticed we both enjoy {interest}. What got you into it?"
        elif recipient_interests:
            interest = recipient_interests[0]
            return f"Hi {recipient_name}! I saw that you're into {interest}. I'd love to hear more about that!"
        else:
            return f"Hey {recipient_name}! Your profile caught my attention. What do you like to do for fun?"
    
    async def generate_multiple_icebreakers(
        self, 
        sender_profile: Dict, 
        recipient_profile: Dict,
        count: int = 3
    ) -> List[str]:
        """
        Generate multiple icebreaker options for the user to choose from
        
        Args:
            sender_profile: Profile of the user sending the message
            recipient_profile: Profile of the user receiving the message
            count: Number of icebreakers to generate
            
        Returns:
            List of generated icebreaker messages
        """
        icebreakers = []
        
        for i in range(count):
            # Use different temperatures for variety
            temperature = 0.7 + (i * 0.15)  # 0.7, 0.85, 1.0
            
            icebreaker = await self.generate_icebreaker(
                sender_profile, 
                recipient_profile,
                temperature=temperature
            )
            
            if icebreaker:
                icebreakers.append(icebreaker)
        
        return icebreakers if icebreakers else [
            self._generate_fallback_icebreaker(sender_profile, recipient_profile)
        ]


# Singleton instance
_ai_service = None

def get_ai_service() -> AIService:
    """Get or create AIService singleton"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
