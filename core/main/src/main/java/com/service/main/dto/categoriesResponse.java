package com.service.main.dto;

import com.service.main.entity.Categories;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class categoriesResponse {

    public categoriesResponse(Categories c) {
        this.id = c.getId();
        this.name = c.getName();
        this.parent_id = c.getParent_id();
    }

    private Integer id;
    private String name;
    private Integer parent_id;
}
