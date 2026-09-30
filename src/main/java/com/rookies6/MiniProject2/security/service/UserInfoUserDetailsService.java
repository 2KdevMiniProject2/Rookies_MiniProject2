package com.rookies6.MiniProject2.security.service;

import com.rookies6.MiniProject2.security.models.UserInfoUserDetails;
import com.rookies6.MiniProject2.user.entity.User;
import com.rookies6.MiniProject2.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserInfoUserDetailsService implements UserDetailsService {

    private final UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> optionalUser = repository.findByEmail(username);
        return optionalUser.map(UserInfoUserDetails::new)
                // optionalUser.map(user -> new UserInfoUserDetails(user))
                .orElseThrow(() -> new UsernameNotFoundException("user not found " + username));
    }
}
