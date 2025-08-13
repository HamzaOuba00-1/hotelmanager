// src/main/java/com/hotelmanager/chat/ws/WebSocketConfig.java
package com.hotelmanager.chat.ws;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // destinations du broker simple (pub/sub)
    config.enableSimpleBroker("/topic", "/queue");
    // préfixe pour @MessageMapping (coté "application")
    config.setApplicationDestinationPrefixes("/app");
    // user destinations (/user/queue/…) si besoin
    config.setUserDestinationPrefix("/user");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws") // URL handshake
        .setAllowedOriginPatterns("http://localhost:3000")
        .withSockJS(); // optionnel: fallback SockJS
  }
}
