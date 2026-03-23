    package com.wecodee.library.management.config;

    import io.jsonwebtoken.Jwts;
    import io.jsonwebtoken.SignatureAlgorithm;
    import io.jsonwebtoken.security.Keys;
    import org.springframework.stereotype.Service;

    import java.security.Key;
    import java.util.Date;

    @Service
    public class JwtService {

        private static final String SECRET_KEY = "mySecretKeymySecretKeymySecretKey";

        private Key getSignKey() {
            return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        }

        public String generateToken(String email) {
            return Jwts.builder()
                    .setSubject(email)
                    .setIssuedAt(new Date(System.currentTimeMillis()))
                    .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                    .signWith(getSignKey(), SignatureAlgorithm.HS256)
                    .compact();
        }

        public String extractEmail(String token) {
            return Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        }

        public boolean isValidToken(String token) {
            return true;
        }
    }
